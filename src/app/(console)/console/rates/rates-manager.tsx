"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { updateRate, type RateResult } from "@/lib/fx-actions";
import type { RateRow } from "@/lib/data/rates";

const inputCls =
  "h-10 w-28 rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

// Inline per-row rate editor. USD is locked (base cross-rate). Writes go through
// the RLS-respecting server action (admin-gated). Currency codes are data — never
// translated. `now` is captured once on the server and passed in, so relative
// timestamps stay pure/deterministic across SSR + hydration (no Date.now in render).
export function RatesManager({ rows, now }: { rows: RateRow[]; now: number }) {
  const t = useTranslations("rates");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [savingCurrency, setSavingCurrency] = useState<string | null>(null);

  async function handle(formData: FormData): Promise<void> {
    const currency = String(formData.get("currency") ?? "");
    setSavingCurrency(currency);
    const r: RateResult = await updateRate(formData);
    setSavingCurrency(null);
    if (r.error) {
      setError(r.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  function relative(iso: string): string {
    const days = Math.max(
      0,
      Math.round((now - new Date(iso).getTime()) / 86400000),
    );
    return days === 0 ? t("today") : t("daysAgo", { days });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <ul className="overflow-hidden rounded-card border border-hairline bg-card">
        {rows.map((r) => {
          const isUsd = r.currency === "USD";
          return (
            <li
              key={r.currency}
              className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-ink">
                    {r.currency}
                  </span>
                  {isUsd && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Lock className="h-3 w-3" aria-hidden />
                      {t("baseLocked")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-faint">
                  {t("updated")}: {relative(r.updatedAt)} ·{" "}
                  <span className="font-mono">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                </span>
              </div>

              {isUsd ? (
                <span className="font-mono text-sm text-muted">1.000000</span>
              ) : (
                <form action={handle} className="flex items-center gap-2">
                  <input type="hidden" name="currency" value={r.currency} />
                  <input
                    name="rate"
                    type="number"
                    step="0.000001"
                    min="0"
                    inputMode="decimal"
                    defaultValue={String(r.rateToUsd)}
                    aria-label={t("rate")}
                    className={inputCls}
                  />
                  <button
                    type="submit"
                    disabled={savingCurrency === r.currency}
                    className="h-10 shrink-0 rounded-btn bg-olive px-4 text-sm font-medium text-canvas disabled:opacity-50"
                  >
                    {savingCurrency === r.currency ? t("saving") : t("save")}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
