import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// SECRET (admin) client — uses the sb_secret_… key, bypasses RLS. Hard-guarded
// server-side by the `server-only` import (a client-component import fails the build).
//
// USAGE RULE: this client is ONLY for `auth.admin.*` calls (invites, listing
// auth users) plus provisioning a brand-new user's own `profiles` row (the new
// user has no session to self-insert). Everything else — all normal table
// reads/writes — MUST go through the regular server/browser clients so RLS
// still applies. Never import this into a client component.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
