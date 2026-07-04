"use server";

import { revalidatePath } from "next/cache";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface NoteResult {
  // i18n key under "notes", or undefined on success.
  error?: string;
  ok?: boolean;
}

export interface SaveNoteInput {
  groupId: string;
  description: string;
  noteDate: string;
  signer1Name: string;
  signer2Name: string;
  signer1Path: string;
  signer2Path: string;
}

// Files a no-receipt note. RLS-respecting client throughout (the insert policy
// enforces submitted_by = auth.uid() AND membership of group_id). signed_at is
// stamped now; updated_at is owned by the notes_set_updated_at trigger — never
// set here.
export async function saveNoReceiptNote(
  input: SaveNoteInput,
): Promise<NoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notSignedIn" };

  const description = input.description.trim();
  const signer1Name = input.signer1Name.trim();
  const signer2Name = input.signer2Name.trim();
  const noteDate = input.noteDate.trim();

  if (
    !input.groupId ||
    !description ||
    !signer1Name ||
    !signer2Name ||
    !input.signer1Path ||
    !input.signer2Path ||
    !/^\d{4}-\d{2}-\d{2}$/.test(noteDate)
  ) {
    return { error: "required" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("no_receipt_notes").insert({
    group_id: input.groupId,
    submitted_by: user.id,
    description,
    note_date: noteDate,
    signer1_name: signer1Name,
    signer2_name: signer2Name,
    signer1_signature_path: input.signer1Path,
    signer2_signature_path: input.signer2Path,
    signer1_signed_at: now,
    signer2_signed_at: now,
  });
  if (error) return { error: "saveFailed" };

  revalidatePath("/");
  return { ok: true };
}

async function callerIsReviewer(): Promise<boolean> {
  return canAccessConsole(await getSessionUser());
}

export async function approveNote(id: string): Promise<NoteResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  if (!id) return { error: "failed" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("no_receipt_notes")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: "failed" };

  revalidatePath("/console/review");
  return { ok: true };
}

// Delete a note from the review queue. treasurer → SOFT (UPDATE deleted_at),
// admin → HARD (DELETE, irreversible). RLS enforces scope on both.
export async function deleteNote(id: string): Promise<NoteResult> {
  const me = await getSessionUser();
  if (!canAccessConsole(me)) return { error: "forbidden" };
  if (!id) return { error: "failed" };

  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  const supabase = await createClient();

  if (isAdmin) {
    const { error } = await supabase
      .from("no_receipt_notes")
      .delete()
      .eq("id", id);
    if (error) return { error: "failed" };
  } else {
    const { error } = await supabase
      .from("no_receipt_notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) return { error: "failed" };
  }

  revalidatePath("/console/review");
  return { ok: true };
}

// Member removes their OWN note — always SOFT, and only while pending. The
// notes_update_owner_pending policy scopes it to the owner's own pending row;
// the explicit filters keep it unambiguous. Error key is in the "member" ns.
export async function softDeleteOwnNote(id: string): Promise<NoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !id) return { error: "deleteFailed" };

  const { error } = await supabase
    .from("no_receipt_notes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("submitted_by", user.id)
    .eq("status", "pending")
    .is("deleted_at", null);
  if (error) return { error: "deleteFailed" };

  revalidatePath("/");
  return { ok: true };
}

export async function rejectNote(
  id: string,
  reason: string,
): Promise<NoteResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  const trimmed = reason.trim();
  if (!id || !trimmed) return { error: "reasonRequired" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("no_receipt_notes")
    .update({ status: "rejected", reject_reason: trimmed })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { error: "failed" };

  revalidatePath("/console/review");
  return { ok: true };
}
