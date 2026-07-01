"use server";

import { createClient } from "@/lib/supabase/server";

export type ParentKind = "receipt" | "note";

export interface CommentItem {
  id: string;
  senderName: string | null;
  createdAt: string;
  body: string;
}

export interface CommentsResult {
  comments?: CommentItem[];
  error?: string;
  ok?: boolean;
}

// Comments on a receipt/note. RLS scopes visibility to who can see the parent;
// sender names resolve via the sanctioned RPC ("Admin" fallback for senders
// outside the group roster). Append-only — no edit/delete.
export async function loadComments(
  kind: ParentKind,
  parentId: string,
  groupId: string,
): Promise<CommentsResult> {
  if (!parentId || !groupId) return { error: "failed" };
  const supabase = await createClient();

  const col = kind === "receipt" ? "receipt_id" : "note_id";
  const { data, error } = await supabase
    .from("comments")
    .select("id, sender_id, body, created_at")
    .eq(col, parentId)
    .order("created_at", { ascending: true });
  if (error) return { error: "failed" };

  const { data: roster } = await supabase.rpc("get_group_member_names", {
    p_group_id: groupId,
  });
  const names = new Map((roster ?? []).map((m) => [m.user_id, m.full_name]));

  return {
    comments: (data ?? []).map((c) => ({
      id: c.id,
      senderName: names.get(c.sender_id) ?? null,
      createdAt: c.created_at,
      body: c.body,
    })),
  };
}

export async function postComment(
  kind: ParentKind,
  parentId: string,
  body: string,
): Promise<CommentsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notSignedIn" };

  const text = body.trim();
  if (!parentId || !text) return { error: "required" };

  // receipt_id XOR note_id; sender_id = self (RLS enforces both).
  const { error } = await supabase.from("comments").insert({
    sender_id: user.id,
    body: text,
    receipt_id: kind === "receipt" ? parentId : null,
    note_id: kind === "note" ? parentId : null,
  });
  if (error) return { error: "failed" };
  return { ok: true };
}
