"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Role = Database["public"]["Enums"]["app_role"];
const ROLES: Role[] = ["admin", "treasurer", "member"];

export interface InviteState {
  // i18n key under the "users" namespace, or undefined.
  error?: string;
  ok?: boolean;
}

export interface RemoveRoleState {
  // i18n key under the "users" namespace, or undefined.
  error?: string;
  ok?: boolean;
}

export interface DeleteUserState {
  // i18n key under the "users" namespace, or undefined.
  error?: string;
  ok?: boolean;
  // Present when error === "hasContent": authored-row counts to surface.
  counts?: {
    receipts: number;
    notes: number;
    tasks: number;
    comments: number;
    messages: number;
  };
}

async function callerIsAdmin(): Promise<boolean> {
  const me = await getSessionUser();
  return !!me && me.assignments.some((a) => a.role === "admin");
}

export async function inviteUser(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  // 1. Authorize the CALLER before doing anything.
  if (!(await callerIsAdmin())) return { error: "forbidden" };

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawGroup = String(formData.get("groupId") ?? "").trim();
  const groupId = rawGroup === "" ? null : rawGroup;
  const role = String(formData.get("role") ?? "") as Role;

  if (!email || !fullName || !ROLES.includes(role)) {
    return { error: "missing" };
  }
  // Members and treasurers are always scoped to a group; only admin may be global.
  if (role !== "admin" && !groupId) return { error: "groupRequired" };

  const admin = createAdminClient();
  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    (hdrs.get("host") ? `https://${hdrs.get("host")}` : "");

  // 2. Create the auth user + send Supabase's invite email in one call.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });
  if (error || !data.user) return { error: "inviteFailed" };
  const userId = data.user.id;

  // 3. Provision the new user's profile row (they have no session to self-insert
  //    → admin client). This is the only non-auth.admin use of the admin client.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: fullName });
  if (profileError) return { error: "profileFailed" };

  // 4. Grant the role via the REGULAR server client — the calling admin's own
  //    session satisfies the user_roles_admin_write RLS policy.
  const supabase = await createClient();
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, group_id: groupId, role });
  if (roleError) return { error: "roleFailed" };

  revalidatePath("/console/users");
  return { ok: true };
}

// Deletes exactly one user_roles row — never a profile, receipt, or note.
// Guards the org against locking itself out: the FINAL admin role can never be
// removed, no matter who removes whom (incl. self-removal).
export async function removeRole(roleId: string): Promise<RemoveRoleState> {
  if (!(await callerIsAdmin())) return { error: "removeFailed" };

  const id = String(roleId ?? "").trim();
  if (!id) return { error: "removeFailed" };

  const supabase = await createClient();

  // Read the target row first so we know its role for the lockout guard. The
  // caller is admin → user_roles_select lets them see every row.
  const { data: target, error: fetchErr } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: "removeFailed" };
  if (!target) return { error: "removeFailed" }; // already gone

  // Last-admin lockout: count remaining admin roles BEFORE deleting; refuse if
  // this is the only one left. Regardless of which admin removes which.
  if (target.role === "admin") {
    const { count, error: countErr } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) return { error: "removeFailed" };
    if ((count ?? 0) <= 1) return { error: "lastAdmin" };
  }

  const { error: delErr } = await supabase
    .from("user_roles")
    .delete()
    .eq("id", id);
  if (delErr) return { error: "removeFailed" };

  revalidatePath("/console/users");
  return { ok: true };
}

// Deletes an auth user. The secret admin client is used ONLY for
// auth.admin.deleteUser (no other table/storage access on it — §8). Two guards
// run FIRST on the RLS-respecting client (admin sees everything):
//   • last-admin lockout (same as #46): never delete the final admin.
//   • authored-content block: receipts/notes/tasks/comments/messages FKs are
//     ON DELETE NO ACTION and would refuse the delete — surface the counts
//     nicely instead of a raw error. profiles + user_roles CASCADE, so a
//     content-free user (even one holding roles) deletes cleanly.
export async function deleteUser(userId: string): Promise<DeleteUserState> {
  if (!(await callerIsAdmin())) return { error: "deleteUserFailed" };

  const id = String(userId ?? "").trim();
  if (!id) return { error: "deleteUserFailed" };

  const supabase = await createClient();

  // Last-admin lockout — mirrors #46. If the target holds an admin role and it's
  // the only admin left, refuse (regardless of who is deleting whom, incl. self).
  const { data: targetRoles, error: rolesErr } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", id);
  if (rolesErr) return { error: "deleteUserFailed" };
  if ((targetRoles ?? []).some((r) => r.role === "admin")) {
    const { count, error: countErr } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) return { error: "deleteUserFailed" };
    if ((count ?? 0) <= 1) return { error: "lastAdmin" };
  }

  // Authored-content pre-check — the NO ACTION FKs would block a raw delete, so
  // count first and surface a friendly message. admin RLS sees every row.
  const [receipts, notes, tasks, comments, messages] = await Promise.all([
    supabase
      .from("receipts")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", id),
    supabase
      .from("no_receipt_notes")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", id),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .or(`assignee.eq.${id},created_by.eq.${id}`),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", id),
    supabase
      .from("group_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", id),
  ]);
  const counts = {
    receipts: receipts.count ?? 0,
    notes: notes.count ?? 0,
    tasks: tasks.count ?? 0,
    comments: comments.count ?? 0,
    messages: messages.count ?? 0,
  };
  const total =
    counts.receipts +
    counts.notes +
    counts.tasks +
    counts.comments +
    counts.messages;
  if (total > 0) return { error: "hasContent", counts };

  // Clear → delete the auth user via the secret client (auth.admin.* ONLY).
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: "deleteUserFailed" };

  revalidatePath("/console/users");
  return { ok: true };
}
