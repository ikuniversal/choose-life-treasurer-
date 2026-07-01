import { cookies } from "next/headers";
import type { RoleAssignment } from "@/lib/auth";
import { ACTIVE_CTX_COOKIE, contextKey } from "@/lib/context";

// The active console context, resolved against the user's REAL assignments.
// Falls back to the first assignment — never invents one the user doesn't hold.
export async function getActiveContext(
  assignments: RoleAssignment[],
): Promise<RoleAssignment | null> {
  if (assignments.length === 0) return null;
  const store = await cookies();
  const active = store.get(ACTIVE_CTX_COOKIE)?.value;
  return assignments.find((a) => contextKey(a) === active) ?? assignments[0];
}
