import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Role = Database["public"]["Enums"]["app_role"];

export interface UserRoleChip {
  id: string;
  role: Role;
  groupId: string | null;
  groupName: string | null;
  /** project scope name for a project_admin chip (else null). UGC. */
  projectName: string | null;
}

export interface UserRow {
  id: string;
  email: string | null;
  fullName: string | null;
  chips: UserRoleChip[];
}

export interface GroupOption {
  id: string;
  name: string;
}

/**
 * Admin-page user overview. Emails come from the auth admin listing (an
 * auth.admin.* call — the only sanctioned admin-client use here); names, roles
 * and group names come through the regular RLS-scoped client.
 */
export async function getUsersOverview(): Promise<UserRow[]> {
  const supabase = await createClient();

  const [rolesRes, profilesRes] = await Promise.all([
    supabase
      .from("user_roles")
      .select("id, user_id, role, group_id, project_id, groups(name), projects(name)"),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const nameById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.full_name]),
  );

  const chipsByUser = new Map<string, UserRoleChip[]>();
  for (const r of rolesRes.data ?? []) {
    const arr = chipsByUser.get(r.user_id) ?? [];
    arr.push({
      id: r.id,
      role: r.role,
      groupId: r.group_id,
      groupName: r.groups?.name ?? null,
      projectName: r.projects?.name ?? null,
    });
    chipsByUser.set(r.user_id, arr);
  }

  const rows: UserRow[] = (list?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    fullName: nameById.get(u.id) ?? null,
    chips: chipsByUser.get(u.id) ?? [],
  }));

  rows.sort((a, b) =>
    (a.fullName ?? a.email ?? "").localeCompare(b.fullName ?? b.email ?? ""),
  );
  return rows;
}

export async function getGroupOptions(): Promise<GroupOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("groups").select("id, name").order("name");
  return data ?? [];
}

// Projects for the invite form's Project Admin picker (mirrors getGroupOptions).
// RLS-respecting client; an admin reads all projects. Names are UGC.
export async function getProjectOptions(): Promise<GroupOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");
  return data ?? [];
}
