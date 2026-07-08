"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractReceipt, type ReceiptExtraction } from "@/lib/ocr";
import { Constants } from "@/lib/supabase/database.types";
import type { Database } from "@/lib/supabase/database.types";

type Category = Database["public"]["Enums"]["expense_category"];
const CATEGORIES = Constants.public.Enums.expense_category as readonly Category[];

export interface SaveState {
  // i18n key under "capture", or undefined.
  error?: string;
  ok?: boolean;
}

// Runs the OCR boundary against the file the client ALREADY holds — passed
// straight through as a FormData entry. We deliberately do NOT re-download the
// just-uploaded object from storage: a member has no SELECT grant on their own
// photo until a receipts row links it (RLS receipt_photos_select), so that
// read-back 400s and hangs the capture flow. Passing the in-memory bytes avoids
// that entirely and is faster. Any failure returns null → manual entry as before.
export async function analyzeReceipt(
  formData: FormData,
): Promise<ReceiptExtraction | null> {
  const file = formData.get("file");
  if (!(file instanceof File)) return null;

  // Only images go to OCR; a PDF / Word attachment skips it (normal path, not a
  // failure). Avoid even reading the bytes for non-images.
  const contentType = file.type || "";
  if (!contentType.startsWith("image/")) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  return extractReceipt(buffer, contentType);
}

// Member removes their OWN receipt — always SOFT, and only while pending. The
// receipts_update_owner_pending policy scopes it to the owner's own pending row;
// the explicit filters keep it unambiguous. Error key is in the "member" ns.
export async function softDeleteOwnReceipt(id: string): Promise<SaveState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !id) return { error: "deleteFailed" };

  const { error } = await supabase
    .from("receipts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("submitted_by", user.id)
    .eq("status", "pending")
    .is("deleted_at", null);
  if (error) return { error: "deleteFailed" };

  revalidatePath("/");
  return { ok: true };
}

export async function saveReceipt(formData: FormData): Promise<SaveState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notSignedIn" };

  const group_id = String(formData.get("groupId") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const receipt_date = String(formData.get("date") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "").trim();
  const category = String(formData.get("category") ?? "") as Category;
  const note = String(formData.get("note") ?? "").trim();
  const photo_path = String(formData.get("photoPath") ?? "").trim();

  // Extra attachments (migration #17): JSON [{ path, mime }]. The primary file
  // stays photo_path above; these are additional evidence. Capped at 5, matching
  // the client. Parsed defensively — a bad payload just means no extras.
  const MAX_ATTACHMENTS = 5;
  let attachments: { path: string; mime: string | null }[] = [];
  try {
    const raw = String(formData.get("attachments") ?? "");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        attachments = parsed
          .map((a) => ({
            path: String((a as { path?: unknown })?.path ?? "").trim(),
            mime:
              typeof (a as { mime?: unknown })?.mime === "string"
                ? ((a as { mime: string }).mime || null)
                : null,
          }))
          .filter((a) => a.path)
          .slice(0, MAX_ATTACHMENTS);
      }
    }
  } catch {
    attachments = [];
  }

  if (
    !group_id ||
    !vendor ||
    !receipt_date ||
    !currency ||
    !photo_path ||
    !CATEGORIES.includes(category) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return { error: "required" };
  }

  // usd_equivalent is LOCKED at submission from the current fx rate (§8) — not
  // derived live on read.
  const { data: fx } = await supabase
    .from("fx_rates")
    .select("rate_to_usd")
    .eq("currency", currency)
    .maybeSingle();
  if (!fx) return { error: "badCurrency" };
  const usd_equivalent = Math.round(amount * fx.rate_to_usd * 100) / 100;

  const { data: inserted, error } = await supabase
    .from("receipts")
    .insert({
      group_id,
      submitted_by: user.id,
      vendor,
      receipt_date,
      amount,
      currency,
      usd_equivalent,
      category,
      status: "pending",
      photo_path,
      additional_info: note || null,
    })
    .select("id")
    .single();
  if (error || !inserted) return { error: "saveFailed" };

  // Attach the extra files (migration #17). Best-effort: the receipt is already
  // saved; a failed attachment insert must not fail the whole submission (the
  // primary evidence is intact). RLS receipt_attachments_insert re-checks the
  // owner + group.
  if (attachments.length > 0) {
    await supabase.from("receipt_attachments").insert(
      attachments.map((a) => ({
        receipt_id: inserted.id,
        path: a.path,
        mime_type: a.mime,
      })),
    );
  }

  revalidatePath("/");
  return { ok: true };
}
