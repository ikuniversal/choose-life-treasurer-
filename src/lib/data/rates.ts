import { createClient } from "@/lib/supabase/server";

// FX rates for the admin rate-edit screen (roadmap #6 slice 2). RLS-respecting
// client (any authenticated user can SELECT fx_rates); writes are gated by the
// fx_rates_admin_write policy in the action layer — no secret client here.

export interface RateRow {
  currency: string;
  rateToUsd: number;
  updatedAt: string;
}

export interface RatesView {
  rows: RateRow[];
  latestUpdatedAt: string | null;
  /** true when the freshest rate is older than 30 days (soft nudge). */
  stale: boolean;
  /** server-captured reference time for relative timestamps (keeps render pure). */
  now: number;
}

const STALE_MS = 30 * 24 * 60 * 60 * 1000;

export async function getRates(): Promise<RatesView> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fx_rates")
    .select("currency, rate_to_usd, updated_at")
    .order("currency");

  const rows: RateRow[] = (data ?? []).map((r) => ({
    currency: r.currency,
    rateToUsd: r.rate_to_usd,
    updatedAt: r.updated_at,
  }));

  const now = Date.now();
  let latest: string | null = null;
  for (const r of rows) if (!latest || r.updatedAt > latest) latest = r.updatedAt;
  const stale = latest
    ? now - new Date(latest).getTime() > STALE_MS
    : false;

  return { rows, latestUpdatedAt: latest, stale, now };
}
