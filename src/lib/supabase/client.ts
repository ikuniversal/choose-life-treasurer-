import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Browser (Client Component) Supabase client. Uses the public-by-design
// publishable key — safe to ship to the browser; RLS is the real access gate.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
