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
      .select("role, group_id, groups(name)")
      .eq("user_id", user.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const assignments: RoleAssignment[] = (rolesRes.data ?? []).map((r) => ({
    role: r.role,
    groupId: r.group_id,
    groupName: r.groups?.name ?? null,
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

/** Treasurer or Admin anywhere → may also access (console). */
export function canAccessConsole(user: SessionUser | null): boolean {
  return (
    !!user &&
    user.assignments.some((a) => a.role === "treasurer" || a.role === "admin")
  );
}

/** The subset of assignments that grant console access (for the switcher). */
export function consoleAssignments(user: SessionUser | null): RoleAssignment[] {
  if (!user) return [];
  return user.assignments.filter(
    (a) => a.role === "treasurer" || a.role === "admin",
  );
}
