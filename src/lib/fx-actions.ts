"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface RateResult {
  // i18n key under "rates", or undefined on success.
  error?: string;
  ok?: boolean;
}

async function callerIsAdmin(): Promise<boolean> {
  const u = await getSessionUser();
  return !!u && u.assignments.some((a) => a.role === "admin");
}

// numeric, > 0, at most 6 decimal places (reject scientific notation, signs, etc.)
function parseRate(v: FormDataEntryValue | null): {
  value: number | null;
  bad: boolean;
} {
  const s = typeof v === "string" ? v.trim() : "";
  if (!/^\d+(\.\d{1,6})?$/.test(s)) return { value: null, bad: true };
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return { value: null, bad: true };
  return { value: n, bad: false };
}

// Update a single currency's rate_to_usd. Admin-only (app check + fx_rates_admin_write
// RLS). USD is the cross-rate base and is never editable. IMPORTANT: fx_rates has NO
// updated_at trigger, so we set updated_at = now() explicitly — otherwise the
// converter's "Rates as of" freshness stamp would never move.
export async function updateRate(formData: FormData): Promise<RateResult> {
  if (!(await callerIsAdmin())) return { error: "forbidden" };

  const currency = String(formData.get("currency") ?? "").trim();
  if (!currency) return { error: "failed" };
  if (currency === "USD") return { error: "usdLocked" };

  const { value, bad } = parseRate(formData.get("rate"));
  if (bad || value === null) return { error: "badRate" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fx_rates")
    .update({ rate_to_usd: value, updated_at: new Date().toISOString() })
    .eq("currency", currency);
  if (error) return { error: "failed" };

  revalidatePath("/console/rates");
  return { ok: true };
}
