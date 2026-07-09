import { getSessionUser, projectAdminProjects } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Read model for the PROJECT ADMIN view of /console/users (migrations #18–#21).
// Everything runs on the RLS-respecting client; a project_admin sees ONLY their
// own project (projects_select_project_admin), its groups
// (groups_project_admin_write USING), and the treasurer/member roster rows in
// those groups (user_roles_select_project_admin).
//
// KNOWN DATA-LAYER LIMITS (flagged for the Director): a project_admin is NOT
// covered by get_group_member_names / profiles SELECT, so member/treasurer NAMES
// don't resolve (we fall back to a short user-id); and they have no receipts/
// notes SELECT, so the child COUNTS read 0. Neither affects safety — the DB
// RESTRICT FKs still refuse a non-empty group delete (23503 → friendly message).

export type ManageableRole = "treasurer" | "member";

export interface PaRosterEntry {
  /** user_roles.id — the target for removal. */
  roleId: string;
  userId: string;
  /** resolved full name if available, else null → the UI shows a short id. */
  name: string | null;
  role: ManageableRole;
}

export interface PaGroup {
  id: string;
  name: string;
  spendingLimit: number | null;
  submissionDeadline: string | null;
  /** RESTRICT-child counts (best-effort — read 0 for a project_admin, see note). */
  receiptCount: number;
  noteCount: number;
  taskCount: number;
  roster: PaRosterEntry[];
}

export interface PaProject {
  projectId: string;
  projectName: string | null;
  groups: PaGroup[];
}

function tally(rows: { group_id: string }[] | null): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows ?? []) m.set(r.group_id, (m.get(r.group_id) ?? 0) + 1);
  return m;
}

export async function getProjectAdminView(): Promise<PaProject[]> {
  const me = await getSessionUser();
  const projects = projectAdminProjects(me);
  if (projects.length === 0) return [];

  const supabase = await createClient();
  const projectIds = projects.map((p) => p.projectId);

  const { data: groupRows } = await supabase
    .from("groups")
    .select("id, name, project_id, spending_limit, submission_deadline")
    .in("project_id", projectIds)
    .order("name");
  const groups = groupRows ?? [];
  const groupIds = groups.map((g) => g.id);

  const [receiptsRes, notesRes, tasksRes, rolesRes] = await Promise.all([
    supabase.from("receipts").select("group_id").in("group_id", groupIds),
    supabase.from("no_receipt_notes").select("group_id").in("group_id", groupIds),
    supabase.from("tasks").select("group_id").in("group_id", groupIds),
    supabase
      .from("user_roles")
      .select("id, user_id, group_id, role")
      .in("group_id", groupIds)
      .in("role", ["treasurer", "member"]),
  ]);
  const rc = tally(receiptsRes.data);
  const nc = tally(notesRes.data);
  const tc = tally(tasksRes.data);

  // Names via the RPC per group — returns [] for a pure project_admin (the RPC
  // gates on admin/treasurer/member of the group), so this is a best-effort
  // resolve with a null fallback.
  const nameByUser = new Map<string, string>();
  await Promise.all(
    groupIds.map(async (gid) => {
      const { data } = await supabase.rpc("get_group_member_names", {
        p_group_id: gid,
      });
      for (const x of data ?? []) {
        if (x.full_name) nameByUser.set(x.user_id, x.full_name);
      }
    }),
  );

  const rosterByGroup = new Map<string, PaRosterEntry[]>();
  for (const r of rolesRes.data ?? []) {
    if (!r.group_id) continue;
    const arr = rosterByGroup.get(r.group_id) ?? [];
    arr.push({
      roleId: r.id,
      userId: r.user_id,
      name: nameByUser.get(r.user_id) ?? null,
      role: r.role as ManageableRole,
    });
    rosterByGroup.set(r.group_id, arr);
  }

  const nameByProject = new Map(
    projects.map((p) => [p.projectId, p.projectName]),
  );
  const groupsByProject = new Map<string, PaGroup[]>();
  for (const g of groups) {
    const arr = groupsByProject.get(g.project_id) ?? [];
    arr.push({
      id: g.id,
      name: g.name,
      spendingLimit: g.spending_limit,
      submissionDeadline: g.submission_deadline,
      receiptCount: rc.get(g.id) ?? 0,
      noteCount: nc.get(g.id) ?? 0,
      taskCount: tc.get(g.id) ?? 0,
      roster: (rosterByGroup.get(g.id) ?? []).sort((a, b) => {
        if (a.role !== b.role) return a.role === "treasurer" ? -1 : 1;
        return (a.name ?? a.userId).localeCompare(b.name ?? b.userId);
      }),
    });
    groupsByProject.set(g.project_id, arr);
  }

  return projectIds.map((pid) => ({
    projectId: pid,
    projectName: nameByProject.get(pid) ?? null,
    groups: groupsByProject.get(pid) ?? [],
  }));
}
