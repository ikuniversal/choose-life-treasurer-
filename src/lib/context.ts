import type { RoleAssignment } from "@/lib/auth";

// Pure context helpers — safe in both client and server bundles (no next/headers
// here; the cookie reader lives in context-server.ts).
export const ACTIVE_CTX_COOKIE = "cl_ctx";

// Stable key for a role assignment (admin has no group → "global").
export function contextKey(a: RoleAssignment): string {
  return `${a.role}:${a.groupId ?? "global"}`;
}
