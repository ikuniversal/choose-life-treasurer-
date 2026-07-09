"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { adminUpdateReceipt } from "@/lib/receipt-actions";
import { Constants } from "@/lib/supabase/database.types";
import type { Database } from "@/lib/supabase/database.types";
import type { ActivityReceipt } from "@/lib/data/user-activity";

type Category = Database["public"]["Enums"]["expense_category"];
const CATEGORIES = Constants.public.Enums.expense_category as readonly Category[];
const RECEIPT_BUCKET = "receipt-photos";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
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
const ALLOWED_EXT = /\.(jpe?g|png|webp|heic|pdf|docx?)$/i;

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

function fileOk(f: File): boolean {
  const typeOk = f.type ? ALLOWED_MIME.includes(f.type) : ALLOWED_EXT.test(f.name);
  return typeOk && f.size <= MAX_UPLOAD_BYTES;
}

// Admin-only inline edit of a single receipt on /console/groups/[id] (#71).
// Editable: all fields + primary photo + attachments (add/remove). NOT editable:
// status (approve/reject stays in /console/review) and is_late/is_duplicate
// (trigger-owned). usd_equivalent recompute is handled server-side.
export function ReceiptEditForm({
  receipt,
  groupId,
  currencies,
  onClose,
}: {
  receipt: ActivityReceipt;
  groupId: string;
  currencies: string[];
  onClose: () => void;
}) {
  const t = useTranslations("groupExpenses");
  const tCat = useTranslations("categories");
  const router = useRouter();

  const [vendor, setVendor] = useState(receipt.vendor);
  const [date, setDate] = useState(receipt.date);
  const [amount, setAmount] = useState(String(receipt.amount));
  const [currency, setCurrency] = useState(receipt.currency);
  const [category, setCategory] = useState<Category>(receipt.category);
  const [note, setNote] = useState(receipt.additionalInfo ?? "");

  const [newPrimary, setNewPrimary] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A currency the editor doesn't recognise (rate row absent) shouldn't vanish
  // silently — keep the current value selectable.
  const currencyOptions = currencies.includes(currency)
    ? currencies
    : [currency, ...currencies];

  function toggleRemove(id: string) {
    setRemoveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function uploadOne(
    file: File,
  ): Promise<{ path: string; mime: string | null }> {
    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${groupId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, file, { upsert: false });
    if (upErr) throw new Error("uploadFailed");
    return { path, mime: file.type || null };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPrimary && !fileOk(newPrimary)) return setError("badFile");
    if (newFiles.some((f) => !fileOk(f))) return setError("badFile");
    if (newFiles.length > MAX_ATTACHMENTS) return setError("tooManyFiles");

    setBusy(true);
    try {
      // Upload replacement primary + any new attachments first (admin storage
      // insert policy, #16). The stored originals of removed/replaced files are
      // left in place (no storage-delete path; consistent with existing orphans).
      const [primaryUp, addUps] = await Promise.all([
        newPrimary ? uploadOne(newPrimary) : Promise.resolve(null),
        Promise.all(newFiles.map(uploadOne)),
      ]);

      const fd = new FormData();
      fd.set("receiptId", receipt.id);
      fd.set("groupId", groupId);
      fd.set("vendor", vendor);
      fd.set("date", date);
      fd.set("amount", amount);
      fd.set("currency", currency);
      fd.set("category", category);
      fd.set("note", note);
      if (primaryUp) fd.set("newPhotoPath", primaryUp.path);
      fd.set("addAttachments", JSON.stringify(addUps));
      fd.set("removeAttachmentIds", JSON.stringify(removeIds));

      const r = await adminUpdateReceipt(fd);
      if (r.error) {
        setError(r.error);
        setBusy(false);
        return;
      }
      if (r.attachmentsBlocked) {
        // Fields saved, but some adds were rejected by RLS — tell the admin.
        setError("attachmentsBlocked");
        setBusy(false);
        router.refresh();
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("uploadFailed");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 border-t border-hairline-row bg-canvas px-4 py-3"
    >
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
            {currencyOptions.map((c) => (
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

      {/* Existing attachments — tap to mark for removal (admin-only DELETE). */}
      {receipt.attachments.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("currentAttachments")}</span>
          <ul className="flex flex-col gap-1">
            {receipt.attachments.map((a) => {
              const marked = removeIds.includes(a.id);
              return (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-w-0 truncate text-sm ${marked ? "text-faint line-through" : "text-olive underline"}`}
                  >
                    {a.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleRemove(a.id)}
                    className="shrink-0 text-xs text-muted underline hover:text-reject"
                  >
                    {marked ? t("undoRemove") : t("removeAttachment")}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Replace primary photo (optional). */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("replacePhoto")}</span>
        <input
          type="file"
          accept={ACCEPT}
          onChange={(e) => setNewPrimary(e.target.files?.[0] ?? null)}
          className="text-sm text-body file:mr-3 file:rounded-btn file:border-0 file:bg-olive file:px-3 file:py-1.5 file:text-sm file:text-canvas"
        />
        {receipt.photoPath && (
          <span className="num text-xs text-faint">
            {t("currentPhoto", {
              name: receipt.photoPath.split("/").pop() ?? receipt.photoPath,
            })}
          </span>
        )}
      </label>

      {/* Add attachments (optional). */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("addAttachments")}</span>
        <input
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
          className="text-sm text-body file:mr-3 file:rounded-btn file:border-0 file:bg-olive file:px-3 file:py-1.5 file:text-sm file:text-canvas"
        />
        {newFiles.length > 0 && (
          <span className="text-xs text-muted">
            {t("addCount", { count: newFiles.length })}
          </span>
        )}
      </label>

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? t("saving") : t("save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={busy}
        >
          <X className="mr-1 h-4 w-4" aria-hidden />
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
