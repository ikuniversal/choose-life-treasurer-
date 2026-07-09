"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, isOrgAdmin } from "@/lib/auth";
import { extractReceipt, type ReceiptExtraction } from "@/lib/ocr";
import { Constants } from "@/lib/supabase/database.types";
import type { Database } from "@/lib/supabase/database.types";

type Category = Database["public"]["Enums"]["expense_category"];
const CATEGORIES = Constants.public.Enums.expense_category as readonly Category[];

// Parse the attachments JSON payload ([{ path, mime }]) defensively — a bad
// payload just yields an empty list. Shared by save + admin-edit. Capped at 5.
const MAX_ATTACHMENTS = 5;
function parseAttachments(raw: string): { path: string; mime: string | null }[] {
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((a) => ({
        path: String((a as { path?: unknown })?.path ?? "").trim(),
        mime:
          typeof (a as { mime?: unknown })?.mime === "string"
            ? ((a as { mime: string }).mime || null)
            : null,
      }))
      .filter((a) => a.path)
      .slice(0, MAX_ATTACHMENTS);
  } catch {
    return [];
  }
}

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
  const attachments = parseAttachments(String(formData.get("attachments") ?? ""));

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

export interface UpdateState {
  // i18n key under "groupExpenses", or undefined.
  error?: string;
  ok?: boolean;
  /** attachment adds rejected by RLS (submitted_by=self) — surfaced, not silent. */
  attachmentsBlocked?: number;
}

// ADMIN-ONLY receipt edit from /console/groups/[id] (#71). An admin may restate
// ANY receipt — all fields + primary photo + attachments — regardless of status.
// The gate is the app-level is_admin check here (RLS receipts_update_treasurer_admin
// ALSO covers treasurers, so RLS alone is not the restriction — the directive scopes
// edit to admin). Trigger-owned fields (is_late, is_duplicate) and status are NEVER
// touched. usd_equivalent is RECOMPUTED at today's fx rate ONLY when amount or
// currency changed (a deliberate, operator-approved exception to the locked-value
// precedent — an admin edit restates the receipt at the current rate); otherwise the
// stored value is left as-is.
export async function adminUpdateReceipt(
  formData: FormData,
): Promise<UpdateState> {
  const supabase = await createClient();

  // App-level admin gate (RLS would also let a treasurer through — not what we want).
  const me = await getSessionUser();
  if (!isOrgAdmin(me)) return { error: "notAllowed" };

  const id = String(formData.get("receiptId") ?? "").trim();
  const group_id = String(formData.get("groupId") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const receipt_date = String(formData.get("date") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "").trim();
  const category = String(formData.get("category") ?? "") as Category;
  const note = String(formData.get("note") ?? "").trim();
  // Optional: a replacement primary photo already uploaded by the client.
  const newPhotoPath = String(formData.get("newPhotoPath") ?? "").trim();
  const addAttachments = parseAttachments(
    String(formData.get("addAttachments") ?? ""),
  );
  // Attachment row ids to remove (admin-only DELETE, migration #17).
  let removeIds: string[] = [];
  try {
    const parsed = JSON.parse(
      String(formData.get("removeAttachmentIds") ?? "[]"),
    );
    if (Array.isArray(parsed)) {
      removeIds = parsed.map((x) => String(x)).filter(Boolean);
    }
  } catch {
    removeIds = [];
  }

  if (
    !id ||
    !vendor ||
    !receipt_date ||
    !currency ||
    !CATEGORIES.includes(category) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return { error: "required" };
  }

  // Read the current row to decide whether usd_equivalent must be recomputed.
  const { data: existing } = await supabase
    .from("receipts")
    .select("amount, currency, usd_equivalent")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!existing) return { error: "notFound" };

  let usd_equivalent = existing.usd_equivalent;
  if (amount !== existing.amount || currency !== existing.currency) {
    const { data: fx } = await supabase
      .from("fx_rates")
      .select("rate_to_usd")
      .eq("currency", currency)
      .maybeSingle();
    if (!fx) return { error: "badCurrency" };
    usd_equivalent = Math.round(amount * fx.rate_to_usd * 100) / 100;
  }

  const update: Database["public"]["Tables"]["receipts"]["Update"] = {
    vendor,
    receipt_date,
    amount,
    currency,
    category,
    additional_info: note || null,
    usd_equivalent,
  };
  if (newPhotoPath) update.photo_path = newPhotoPath; // replace primary evidence

  // is_late / is_duplicate / status deliberately absent → left untouched.
  const { data: updated, error } = await supabase
    .from("receipts")
    .update(update)
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !updated) return { error: "saveFailed" };

  // Remove attachments the admin marked (admin-only DELETE policy).
  if (removeIds.length > 0) {
    await supabase
      .from("receipt_attachments")
      .delete()
      .in("id", removeIds)
      .eq("receipt_id", id);
  }

  // Add attachments — best-effort. NOTE: receipt_attachments_insert requires
  // submitted_by = auth.uid(), so an admin can only add to receipts THEY filed
  // (e.g. #16 any-group capture). Adds to another member's receipt are rejected;
  // we report the blocked count instead of failing silently. A Director-authored
  // is_admin INSERT policy would close this (flagged in the PR).
  let attachmentsBlocked = 0;
  if (addAttachments.length > 0) {
    const { error: insErr } = await supabase.from("receipt_attachments").insert(
      addAttachments.map((a) => ({
        receipt_id: id,
        path: a.path,
        mime_type: a.mime,
      })),
    );
    if (insErr) attachmentsBlocked = addAttachments.length;
  }

  if (group_id) revalidatePath(`/console/groups/${group_id}`);
  revalidatePath("/console"); // dashboard totals read live
  return {
    ok: true,
    attachmentsBlocked: attachmentsBlocked || undefined,
  };
}
