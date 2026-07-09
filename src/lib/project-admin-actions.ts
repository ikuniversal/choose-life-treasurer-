"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ManageableRole } from "@/lib/data/project-admin";

// Project-admin-scoped group + role management (migrations #18–#21). These are
// KEPT SEPARATE from the is_admin()-gated project-actions: the caller check here
// is "is a project_admin of some project", and the migration #20 RLS policies
// (groups_project_admin_write, user_roles_project_admin_write/_delete) are the
// REAL gate — every write is silently scoped to the caller's own project. Error
// keys resolve under the "projectAdmin" i18n namespace.

export interface PaResult {
  error?: string;
  ok?: boolean;
}

async function callerIsProjectAdmin(): Promise<boolean> {
  const u = await getSessionUser();
  return !!u && u.assignments.some((a) => a.role === "project_admin");
}

function parseLimit(v: FormDataEntryValue | null): {
  value: number | null;
  bad: boolean;
} {
  const s = typeof v === "string" ? v.trim() : "";
  if (s === "") return { value: null, bad: false };
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return { value: null, bad: true };
  return { value: n, bad: false };
}

function parseDate(v: FormDataEntryValue | null): {
  value: string | null;
  bad: boolean;
} {
  const s = typeof v === "string" ? v.trim() : "";
  if (s === "") return { value: null, bad: false };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { value: null, bad: true };
  return { value: s, bad: false };
}

export async function paCreateGroup(formData: FormData): Promise<PaResult> {
  if (!(await callerIsProjectAdmin())) return { error: "forbidden" };
  const project_id = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!project_id || !name) return { error: "nameRequired" };

  const lim = parseLimit(formData.get("spendingLimit"));
  if (lim.bad) return { error: "badLimit" };
  const dl = parseDate(formData.get("deadline"));
  if (dl.bad) return { error: "badDate" };

  const supabase = await createClient();
  // groups_project_admin_write WITH CHECK enforces "own project only".
  const { data, error } = await supabase
    .from("groups")
    .insert({
      project_id,
      name,
      spending_limit: lim.value,
      submission_deadline: dl.value,
    })
    .select("id");
  if (error) return { error: "failed" };
  if (!data || data.length === 0) return { error: "forbidden" };

  revalidatePath("/console/users");
  return { ok: true };
}

export async function paUpdateGroup(formData: FormData): Promise<PaResult> {
  if (!(await callerIsProjectAdmin())) return { error: "forbidden" };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "nameRequired" };

  const lim = parseLimit(formData.get("spendingLimit"));
  if (lim.bad) return { error: "badLimit" };
  const dl = parseDate(formData.get("deadline"));
  if (dl.bad) return { error: "badDate" };

  const supabase = await createClient();
  // updated_at handled by the groups_set_updated_at trigger — don't set it.
  const { data, error } = await supabase
    .from("groups")
    .update({ name, spending_limit: lim.value, submission_deadline: dl.value })
    .eq("id", id)
    .select("id");
  if (error) return { error: "failed" };
  if (!data || data.length === 0) return { error: "forbidden" }; // not in scope

  revalidatePath("/console/users");
  return { ok: true };
}

export async function paDeleteGroup(formData: FormData): Promise<PaResult> {
  if (!(await callerIsProjectAdmin())) return { error: "forbidden" };
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "failed" };

  const supabase = await createClient();
  // RESTRICT FKs (receipts/notes/tasks → groups) refuse a non-empty group (23503
  // → cannotDelete). RLS scopes the delete to the caller's own project.
  const { data, error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { error: error.code === "23503" ? "cannotDelete" : "failed" };
  if (!data || data.length === 0) return { error: "forbidden" };

  revalidatePath("/console/users");
  return { ok: true };
}

// Assign an EXISTING user as treasurer OR member of a group in the caller's own
// project. Never admin/project_admin (migration #20 WITH CHECK enforces both the
// role allow-list and the own-project scope).
export async function paAssignRole(
  userId: string,
  groupId: string,
  role: ManageableRole,
): Promise<PaResult> {
  if (!(await callerIsProjectAdmin())) return { error: "forbidden" };
  const uid = String(userId ?? "").trim();
  const gid = String(groupId ?? "").trim();
  if (!uid || !gid || (role !== "treasurer" && role !== "member")) {
    return { error: "roleFailed" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .insert({ user_id: uid, group_id: gid, role })
    .select("id");
  if (error) return { error: "roleFailed" };
  if (!data || data.length === 0) return { error: "forbidden" };

  revalidatePath("/console/users");
  return { ok: true };
}

// Remove a treasurer/member role row (by id). RLS user_roles_project_admin_delete
// enforces role ∈ {treasurer, member} AND the caller's own project.
export async function paRemoveRole(roleId: string): Promise<PaResult> {
  if (!(await callerIsProjectAdmin())) return { error: "forbidden" };
  const id = String(roleId ?? "").trim();
  if (!id) return { error: "roleFailed" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { error: "roleFailed" };
  if (!data || data.length === 0) return { error: "forbidden" };

  revalidatePath("/console/users");
  return { ok: true };
}
