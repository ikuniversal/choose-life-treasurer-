"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

type Phase = "idle" | "uploading" | "analyzing" | "verify" | "saving" | "done";

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

export function CaptureForm({
  groups,
  currencies,
  today,
}: {
  groups: MemberGroup[];
  currencies: string[];
  today: string;
}) {
  const t = useTranslations("capture");
  const tCat = useTranslations("categories");
  const tDeadline = useTranslations("deadline");
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] ?? "");
  const [category, setCategory] = useState<Category>("other");
  const [note, setNote] = useState("");

  const busy = phase === "uploading" || phase === "analyzing" || phase === "saving";

  const deadline = groups.find((g) => g.id === groupId)?.deadline ?? null;
  const deadlinePassed = deadline !== null && deadline < today;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;
    setError(null);

    // Client-side validation (server RLS + bucket mime allow-list are the real gate).
    const typeOk = file.type
      ? ALLOWED_MIME.includes(file.type)
      : ALLOWED_EXT.test(file.name);
    if (!typeOk) {
      setError("badFileType");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("badFileSize");
      return;
    }
    const isImage = file.type
      ? file.type.startsWith("image/")
      : IMAGE_EXT.test(file.name);

    setPhase("uploading");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${groupId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, file, { upsert: false });
    if (upErr) {
      setError("uploadFailed");
      setPhase("idle");
      return;
    }
    setPhotoPath(path);

    // OCR only applies to images. A PDF / Word doc goes straight to manual entry —
    // a NORMAL path, not a failure, so no "couldn't read" message is shown.
    // Pass the in-memory File straight to the OCR action — never re-fetch what we
    // just uploaded (the read-back would 400 under RLS and hang the spinner).
    if (isImage) {
      setPhase("analyzing");
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await analyzeReceipt(fd);
        if (res) {
          if (res.vendor) setVendor(res.vendor);
          if (res.date) setDate(res.date);
          if (res.amount != null) setAmount(String(res.amount));
          if (res.currency && currencies.includes(res.currency))
            setCurrency(res.currency);
          if (res.category && CATEGORIES.includes(res.category as Category))
            setCategory(res.category as Category);
        } else {
          setError("analyzeFailed");
        }
      } catch {
        // OCR failed hard (e.g. payload/network) → manual entry, never a hang.
        setError("analyzeFailed");
      }
    }
    // ALWAYS resolves the spinner — the verify form shows regardless of OCR result.
    setPhase("verify");
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

    const r = await saveReceipt(fd);
    if (r.error) {
      setError(r.error);
      setPhase("verify");
      return;
    }
    setPhase("done");
    router.push("/");
  }

  function startOver() {
    setPhase("idle");
    setError(null);
    setPhotoPath(null);
    setVendor("");
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
    if (fileRef.current) fileRef.current.value = "";
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
              Library / Browse Files). Accepts images + PDF + Word. */}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            onChange={onFile}
            className="text-sm text-body file:mr-3 file:rounded-btn file:border-0 file:bg-olive file:px-4 file:py-2 file:text-sm file:text-canvas"
          />
          <span className="text-xs text-faint">{t("fileHint")}</span>
        </label>
      )}

      {(phase === "uploading" || phase === "analyzing") && (
        <p className="text-sm text-muted">
          {phase === "uploading" ? t("uploading") : t("analyzing")}
        </p>
      )}

      {(phase === "verify" || phase === "saving") && (
        <form onSubmit={onSave} className="flex flex-col gap-3">
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
