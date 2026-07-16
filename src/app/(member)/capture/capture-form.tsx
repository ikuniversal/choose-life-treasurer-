"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { analyzeReceipt, saveReceipt } from "@/lib/receipt-actions";
import { Constants } from "@/lib/supabase/database.types";
import type { Database } from "@/lib/supabase/database.types";
import type { MemberGroup } from "@/lib/data/member-groups";

type Category = Database["public"]["Enums"]["expense_category"];
const CATEGORIES = Constants.public.Enums.expense_category as readonly Category[];
const RECEIPT_BUCKET = "receipt-photos";

// Receipt evidence: images (camera/library) OR a PDF / Word document. Matches the
// bucket's allowed mime types (Director-applied). 10MB ceiling matches the bucket.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
// A receipt may carry extra attachments beyond the primary (migration #17).
const MAX_ATTACHMENTS = 5;
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT = ALLOWED_MIME.join(",");
// Fallback when the browser reports an empty mime type (e.g. some HEIC pickers).
const ALLOWED_EXT = /\.(jpe?g|png|webp|heic|pdf|docx?)$/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|heic)$/i;

// OCR speed: downscale the image CLIENT-SIDE for the OCR call ONLY (the stored
// original is never touched). ~1600px max edge + JPEG 0.75 shrinks the analyze
// payload ~10× with no loss of evidence quality. Falls back to the original
// bytes on any failure.
const OCR_MAX_EDGE = 1600;
const OCR_JPEG_QUALITY = 0.75;

async function downscaleForOcr(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    const scale = Math.min(1, OCR_MAX_EDGE / Math.max(img.width, img.height));
    if (scale >= 1) return file; // already small enough — send as-is
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", OCR_JPEG_QUALITY),
    );
    return blob ?? file;
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isImageFile(f: File): boolean {
  return f.type ? f.type.startsWith("image/") : IMAGE_EXT.test(f.name);
}

type Phase = "idle" | "uploading" | "analyzing" | "verify" | "saving" | "done";

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

export function CaptureForm({
  groups,
  currencies,
  today,
  defaultGroup,
}: {
  groups: MemberGroup[];
  currencies: string[];
  today: string;
  /** pre-selected group from a deep-link (?group=<id>, #72); validated upstream. */
  defaultGroup?: string;
}) {
  const t = useTranslations("capture");
  const tCat = useTranslations("categories");
  const tDeadline = useTranslations("deadline");
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  // Extra attachments uploaded alongside the primary (path + mime for the row).
  const [attachments, setAttachments] = useState<
    { path: string; mime: string | null }[]
  >([]);
  // Local preview of the chosen primary file (object URL for images) — drives the
  // upload-confirmation card so the member visibly sees what was submitted.
  const [preview, setPreview] = useState<{
    url: string | null;
    isImage: boolean;
    name: string;
  } | null>(null);
  const [saved, setSaved] = useState<{
    previewUrl: string | null;
    isImage: boolean;
    fileName: string;
    vendor: string;
    amount: string;
    currency: string;
    at: string;
    attachmentCount: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [groupId, setGroupId] = useState(
    // Deep-linked group wins when valid; else the normal first-group default.
    defaultGroup && groups.some((g) => g.id === defaultGroup)
      ? defaultGroup
      : (groups[0]?.id ?? ""),
  );
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] ?? "");
  const [category, setCategory] = useState<Category>("other");
  const [note, setNote] = useState("");

  const busy = phase === "uploading" || phase === "analyzing" || phase === "saving";

  const deadline = groups.find((g) => g.id === groupId)?.deadline ?? null;
  const deadlinePassed = deadline !== null && deadline < today;

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0 || !groupId) return;
    const files = Array.from(list);
    setError(null);

    // Client-side validation (server RLS + bucket mime allow-list are the real gate).
    for (const f of files) {
      const typeOk = f.type ? ALLOWED_MIME.includes(f.type) : ALLOWED_EXT.test(f.name);
      if (!typeOk) {
        setError("badFileType");
        return;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        setError("badFileSize");
        return;
      }
    }

    // PRIMARY = the first image (OCR source + photo_path); if none, the first
    // file. Everything else becomes an attachment (capped at 5).
    const firstImageIdx = files.findIndex(isImageFile);
    const primaryIdx = firstImageIdx === -1 ? 0 : firstImageIdx;
    const primary = files[primaryIdx];
    const rest = files.filter((_, i) => i !== primaryIdx);
    if (rest.length > MAX_ATTACHMENTS) {
      setError("tooManyFiles");
      return;
    }
    const primaryIsImage = isImageFile(primary);

    setPhase(primaryIsImage ? "analyzing" : "uploading");
    const supabase = createClient();

    async function uploadOne(
      file: File,
    ): Promise<{ path: string; mime: string | null }> {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${groupId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(RECEIPT_BUCKET)
        .upload(path, file, { upsert: false });
      if (upErr) throw new Error("uploadFailed");
      return { path, mime: file.type || null };
    }

    // OCR runs in PARALLEL with all uploads and on the DOWNSCALED image only.
    const ocrPromise = primaryIsImage
      ? (async () => {
          try {
            const blob = await downscaleForOcr(primary);
            const ocrFile =
              blob instanceof File
                ? blob
                : new File([blob], "ocr.jpg", { type: "image/jpeg" });
            const fd = new FormData();
            fd.set("file", ocrFile);
            return await analyzeReceipt(fd);
          } catch {
            return null;
          }
        })()
      : Promise.resolve(null);

    try {
      const [primaryUp, restUp, ocr] = await Promise.all([
        uploadOne(primary),
        Promise.all(rest.map(uploadOne)),
        ocrPromise,
      ]);

      setPhotoPath(primaryUp.path);
      setAttachments(restUp);
      setPreview({
        url: primaryIsImage ? URL.createObjectURL(primary) : null,
        isImage: primaryIsImage,
        name: primary.name,
      });

      if (primaryIsImage) {
        if (ocr) {
          if (ocr.vendor) setVendor(ocr.vendor);
          if (ocr.date) setDate(ocr.date);
          if (ocr.amount != null) setAmount(String(ocr.amount));
          if (ocr.currency && currencies.includes(ocr.currency))
            setCurrency(ocr.currency);
          if (ocr.category && CATEGORIES.includes(ocr.category as Category))
            setCategory(ocr.category as Category);
        } else {
          setError("analyzeFailed");
        }
      }
      // ALWAYS resolves to the verify form regardless of OCR result.
      setPhase("verify");
    } catch {
      setError("uploadFailed");
      setPhase("idle");
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!photoPath) return;
    setError(null);
    setPhase("saving");

    const fd = new FormData();
    fd.set("groupId", groupId);
    fd.set("vendor", vendor);
    fd.set("date", date);
    fd.set("amount", amount);
    fd.set("currency", currency);
    fd.set("category", category);
    fd.set("note", note);
    fd.set("photoPath", photoPath);
    fd.set("attachments", JSON.stringify(attachments));

    const r = await saveReceipt(fd);
    if (r.error) {
      setError(r.error);
      setPhase("verify");
      return;
    }
    // Unmistakable confirmation before leaving the flow.
    setSaved({
      previewUrl: preview?.url ?? null,
      isImage: preview?.isImage ?? false,
      fileName: preview?.name ?? "",
      vendor,
      amount,
      currency,
      at: new Date().toISOString(),
      attachmentCount: attachments.length,
    });
    setPhase("done");
  }

  function startOver() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPhase("idle");
    setError(null);
    setPhotoPath(null);
    setAttachments([]);
    setPreview(null);
    setSaved(null);
    setVendor("");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
    if (fileRef.current) fileRef.current.value = "";
  }

  // Success confirmation — a persistent card shown after the receipt saves.
  if (phase === "done" && saved) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-start gap-3 rounded-card border border-hairline bg-card p-4">
          {saved.previewUrl && saved.isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={saved.previewUrl}
              alt={saved.vendor || saved.fileName}
              className="h-16 w-16 shrink-0 rounded-input border border-hairline object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-input border border-hairline p-1 text-olive">
              <FileText className="h-6 w-6" aria-hidden />
              {/* file name is UGC — never translated */}
              <span className="w-full truncate text-center text-[9px] text-muted">
                {saved.fileName}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-approve">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              {t("submitted")}
            </p>
            {/* vendor is UGC — never translated */}
            {saved.vendor && (
              <p className="mt-1 truncate text-sm font-medium text-ink">
                {saved.vendor}
              </p>
            )}
            {saved.amount && (
              <p className="num text-sm text-olive">
                {saved.amount} {saved.currency}
              </p>
            )}
            {saved.attachmentCount > 0 && (
              <p className="mt-1 text-xs text-muted">
                {t("attachedCount", { count: saved.attachmentCount })}
              </p>
            )}
            <p className="mt-1 num text-xs text-faint">
              {new Date(saved.at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => router.push("/")}>
            {t("done")}
          </Button>
          <Button type="button" variant="ghost" onClick={startOver}>
            {t("addAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("group")}</span>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          disabled={!!photoPath}
          className={inputCls}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      {deadline && (
        <div className="-mt-1 text-xs">
          <span className="text-muted">
            {tDeadline("label", { date: deadline })}
          </span>
          {deadlinePassed && (
            <p className="mt-1 rounded-input bg-status-pending-bg px-2 py-1 text-status-pending-fg">
              {tDeadline("passed")}
            </p>
          )}
        </div>
      )}

      {phase === "idle" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("photo")}</span>
          {/* No `capture` attr → the OS shows its native picker (Camera / Photo
              Library / Browse Files). Accepts images + PDF + Word, multiple. */}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={onFiles}
            className="text-sm text-body file:mr-3 file:rounded-btn file:border-0 file:bg-olive file:px-4 file:py-2 file:text-sm file:text-canvas"
          />
          <span className="text-xs text-faint">{t("fileHintMulti")}</span>
        </label>
      )}

      {(phase === "uploading" || phase === "analyzing") && (
        <p className="text-sm text-muted">
          {phase === "uploading" ? t("uploading") : t("analyzing")}
        </p>
      )}

      {(phase === "verify" || phase === "saving") && (
        <form onSubmit={onSave} className="flex flex-col gap-3">
          {attachments.length > 0 && (
            <p className="text-xs text-muted">
              {t("attachedCount", { count: attachments.length })}
            </p>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("vendor")}</span>
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
              className={inputCls}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("date")}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("amount")}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={`${inputCls} font-mono`}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("currency")}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
                className={inputCls}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("category")}</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {tCat(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("note")}</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputCls} h-auto py-2`}
            />
          </label>

          {error && <p className="text-sm text-reject">{t(error)}</p>}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={busy}>
              {phase === "saving" ? t("saving") : t("save")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={startOver}
              disabled={busy}
            >
              {t("startOver")}
            </Button>
          </div>
        </form>
      )}

      {error && phase === "idle" && (
        <p className="text-sm text-reject">{t(error)}</p>
      )}
    </div>
  );
}
