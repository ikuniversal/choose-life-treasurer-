"use server";

import { revalidatePath } from "next/cache";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ReviewResult {
  // i18n key under "review", or undefined on success.
  error?: string;
  ok?: boolean;
}

// UI-level gate; RLS is the real enforcement (treasurer limited to their groups).
async function callerIsReviewer(): Promise<boolean> {
  return canAccessConsole(await getSessionUser());
}

export async function approveReceipt(id: string): Promise<ReviewResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  if (!id) return { error: "failed" };

  const supabase = await createClient();
  // .eq('status','pending') guards against acting on an already-decided receipt.
  const { error } = await supabase
    .from("receipts")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: "failed" };

  revalidatePath("/console/review");
  return { ok: true };
}

export async function rejectReceipt(
  id: string,
  reason: string,
): Promise<ReviewResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  const trimmed = reason.trim();
  // reject_reason is required, non-empty, treasurer-authored UGC (never translated).
  if (!id || !trimmed) return { error: "reasonRequired" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("receipts")
    .update({ status: "rejected", reject_reason: trimmed })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: "failed" };

  revalidatePath("/console/review");
  return { ok: true };
}

export async function bulkApprove(ids: string[]): Promise<ReviewResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  const clean = [...new Set(ids)].filter(Boolean);
  if (!clean.length) return { error: "failed" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("receipts")
    .update({ status: "approved" })
    .in("id", clean)
    .eq("status", "pending");
  if (error) return { error: "failed" };

  revalidatePath("/console/review");
  return { ok: true };
}
