"use server";

import { createClient } from "@/lib/supabase/server";

export interface ChatMessage {
  id: string;
  senderName: string | null;
  createdAt: string;
  body: string;
}

export interface ChatResult {
  messages?: ChatMessage[];
  hasMore?: boolean;
  error?: string;
  ok?: boolean;
}

const PAGE = 50;

// Group chat page. RLS scopes to group members + admin. Uses the
// (group_id, created_at) index: newest PAGE via a descending limit, returned
// oldest-first for display. `beforeIso` pages older. Append-only.
export async function loadGroupMessages(
  groupId: string,
  beforeIso?: string,
): Promise<ChatResult> {
  if (!groupId) return { error: "failed" };
  const supabase = await createClient();

  let query = supabase
    .from("group_messages")
    .select("id, sender_id, body, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(PAGE + 1);
  if (beforeIso) query = query.lt("created_at", beforeIso);

  const { data, error } = await query;
  if (error) return { error: "failed" };

  const rows = data ?? [];
  const hasMore = rows.length > PAGE;
  const page = rows.slice(0, PAGE);

  const { data: roster } = await supabase.rpc("get_group_member_names", {
    p_group_id: groupId,
  });
  const names = new Map((roster ?? []).map((m) => [m.user_id, m.full_name]));

  const messages = page
    .reverse()
    .map((m) => ({
      id: m.id,
      senderName: names.get(m.sender_id) ?? null,
      createdAt: m.created_at,
      body: m.body,
    }));

  return { messages, hasMore };
}

export async function postGroupMessage(
  groupId: string,
  body: string,
): Promise<ChatResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "notSignedIn" };

  const text = body.trim();
  if (!groupId || !text) return { error: "required" };

  // DB also rejects empty/whitespace; sender_id = self (RLS enforces).
  const { error } = await supabase
    .from("group_messages")
    .insert({ group_id: groupId, sender_id: user.id, body: text });
  if (error) return { error: "failed" };
  return { ok: true };
}
