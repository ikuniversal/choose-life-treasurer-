"use server";

import { cookies } from "next/headers";
import { ACTIVE_CTX_COOKIE } from "@/lib/context";

// Persist the chosen console context. The caller only ever passes a key derived
// from one of the user's own assignments; RLS remains the real access gate, so
// this cookie is a view preference, not a privilege grant.
export async function setActiveContext(key: string) {
  const store = await cookies();
  store.set(ACTIVE_CTX_COOKIE, key, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
