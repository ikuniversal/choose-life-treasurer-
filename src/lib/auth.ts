// AUTH / ROLE GATING — STUB ONLY.
//
// Real Supabase Auth + RLS-scoped roles land in a follow-up PR (PROJECT_STATE
// §4/§9). This module exists so route layouts can call a stable boundary now;
// swapping in the real session lookup should not require touching callers.

export type Role = "member" | "treasurer" | "admin";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  // Group scoping that RLS will enforce for real later.
  groupIds: string[];
}

// Fixed demo identity. Replace with Supabase session resolution.
const DEMO_USER: SessionUser = {
  id: "demo-user",
  name: "Demo User",
  role: "admin",
  groupIds: ["demo-group"],
};

export async function getSessionUser(): Promise<SessionUser | null> {
  // TODO(auth): read the Supabase session instead of returning the demo user.
  return DEMO_USER;
}

export function canAccessConsole(user: SessionUser | null): boolean {
  return user?.role === "treasurer" || user?.role === "admin";
}
