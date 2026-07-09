// AUTH / ROLE RESOLUTION — real Supabase session + role lookup.
//
// Reads the verified server-side session (supabase.auth.getUser()) and the
// user's user_roles assignments. RLS enforces data scoping; these helpers drive
// UI-level route gating and the console context switcher. No pretend-role logic:
// a user's roles are exactly their user_roles rows, nothing synthesised.

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Role = Database["public"]["Enums"]["app_role"];

export interface RoleAssignment {
  role: Role;
  /** null for a global (group-less) assignment, e.g. an org admin. */
  groupId: string | null;
  /** group display name (UGC — never translated); null when global. */
  groupName: string | null;
  /** set only for a project_admin assignment (scoped by project, not group). */
  projectId: string | null;
  /** project display name (UGC — never translated); null unless project_admin. */
  projectName: string | null;
}

export interface SessionUser {
  id: string;
  email: string | null;
  /** profile full name (UGC — never translated). */
  fullName: string | null;
  assignments: RoleAssignment[];
}

/**
 * The verified signed-in user with their role assignments, or null when there
 * is no session. Never throws on the no-session path.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [rolesRes, profileRes] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role, group_id, project_id, groups(name), projects(name)")
      .eq("user_id", user.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const assignments: RoleAssignment[] = (rolesRes.data ?? []).map((r) => ({
    role: r.role,
    groupId: r.group_id,
    groupName: r.groups?.name ?? null,
    projectId: r.project_id,
    projectName: r.projects?.name ?? null,
  }));

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: profileRes.data?.full_name ?? null,
    assignments,
  };
}

/** True when the user holds at least one role row → may access (member). */
export function hasAnyRole(user: SessionUser | null): boolean {
  return !!user && user.assignments.length > 0;
}

const CONSOLE_ROLES: Role[] = ["treasurer", "admin", "project_admin"];

/** Treasurer, Admin, or Project Admin anywhere → may also access (console). */
export function canAccessConsole(user: SessionUser | null): boolean {
  return !!user && user.assignments.some((a) => CONSOLE_ROLES.includes(a.role));
}

/** The subset of assignments that grant console access (for the switcher). */
export function consoleAssignments(user: SessionUser | null): RoleAssignment[] {
  if (!user) return [];
  return user.assignments.filter((a) => CONSOLE_ROLES.includes(a.role));
}

/** Org-wide admin (unchanged meaning — never a project_admin). */
export function isOrgAdmin(user: SessionUser | null): boolean {
  return !!user && user.assignments.some((a) => a.role === "admin");
}

/** The distinct projects this user is a project_admin of (id + display name). */
export function projectAdminProjects(
  user: SessionUser | null,
): { projectId: string; projectName: string | null }[] {
  if (!user) return [];
  const seen = new Set<string>();
  const out: { projectId: string; projectName: string | null }[] = [];
  for (const a of user.assignments) {
    if (a.role === "project_admin" && a.projectId && !seen.has(a.projectId)) {
      seen.add(a.projectId);
      out.push({ projectId: a.projectId, projectName: a.projectName });
    }
  }
  return out;
}
