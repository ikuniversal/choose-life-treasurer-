"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractReceipt, type ReceiptExtraction } from "@/lib/ocr";
import { Constants } from "@/lib/supabase/database.types";
import type { Database } from "@/lib/supabase/database.types";

type Category = Database["public"]["Enums"]["expense_category"];
const CATEGORIES = Constants.public.Enums.expense_category as readonly Category[];

const RECEIPT_BUCKET = "receipt-photos";

export interface SaveState {
  // i18n key under "capture", or undefined.
  error?: string;
  ok?: boolean;
}

// Runs the OCR boundary against an already-uploaded image. Downloads the bytes
// via the RLS-scoped client (the caller can only read their own group's object)
// and hands a Buffer to lib/ocr (real Azure Document Intelligence). Any failure —
// download error or an OCR miss — returns null, and the client falls through to
// manual entry exactly as before.
export async function analyzeReceipt(
  path: string,
): Promise<ReceiptExtraction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .download(path);
  if (error || !data) return null;

  const buffer = Buffer.from(await data.arrayBuffer());
  return extractReceipt(buffer);
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
