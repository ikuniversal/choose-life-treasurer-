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

  const { error } = await supabase.from("receipts").insert({
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
  });
  if (error) return { error: "saveFailed" };

  revalidatePath("/");
  return { ok: true };
}
