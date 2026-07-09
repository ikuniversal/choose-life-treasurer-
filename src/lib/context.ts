import type { RoleAssignment } from "@/lib/auth";

// Pure context helpers — safe in both client and server bundles (no next/headers
// here; the cookie reader lives in context-server.ts).
export const ACTIVE_CTX_COOKIE = "cl_ctx";

// Stable key for a role assignment. Group roles key by group; a project_admin
// keys by project (group-less); a plain admin has neither → "global".
export function contextKey(a: RoleAssignment): string {
  return `${a.role}:${a.groupId ?? a.projectId ?? "global"}`;
}
