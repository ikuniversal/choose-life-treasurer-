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

// Delete a receipt from the review queue. Actor role decides the mechanism:
//   • treasurer → SOFT delete (UPDATE deleted_at = now()) via receipts_update_treasurer_admin
//   • admin     → HARD delete (DELETE the row, irreversible) via receipts_delete_admin
// Both run on the RLS-respecting client; RLS is the real scope gate.
export async function deleteReceipt(id: string): Promise<ReviewResult> {
  const me = await getSessionUser();
  if (!canAccessConsole(me)) return { error: "forbidden" };
  if (!id) return { error: "failed" };

  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  const supabase = await createClient();

  if (isAdmin) {
    const { error } = await supabase.from("receipts").delete().eq("id", id);
    if (error) return { error: "failed" };
  } else {
    const { error } = await supabase
      .from("receipts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) return { error: "failed" };
  }

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
