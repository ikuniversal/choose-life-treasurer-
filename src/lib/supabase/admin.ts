import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// SERVICE-ROLE admin client — bypasses RLS. Hard-guarded server-side by the
// `server-only` import (a client-component import fails the build).
//
// USAGE RULE: this client is ONLY for `auth.admin.*` calls (invites, listing
// auth users) plus provisioning a brand-new user's own `profiles` row (the new
// user has no session to self-insert). Everything else — all normal table
// reads/writes — MUST go through the regular server/browser clients so RLS
// still applies. Never import this into a client component.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
