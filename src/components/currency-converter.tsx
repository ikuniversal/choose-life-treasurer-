"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Rate {
  currency: string;
  rate_to_usd: number;
  updated_at: string;
}

// Read-only FX converter (roadmap #5 slice 4). Rates load ONCE per mount via the
// RLS-respecting browser client — any authenticated user can SELECT fx_rates — and
// conversion is pure client-side math on the USD cross-rate:
//   result = amount × rate_to_usd(from) ÷ rate_to_usd(to)
// No writes, no polling, no rate editing. This never touches how a receipt's
// usd_equivalent is computed (that stays locked-at-submission, PROJECT_STATE §8).
export function CurrencyConverter() {
  const t = useTranslations("converter");
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("fx_rates")
      .select("currency, rate_to_usd, updated_at")
      .order("currency")
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data || data.length === 0) {
          setFailed(true);
          return;
        }
        setRates(data);
        // Members converting local spend → USD is the core use, so default the
        // target to USD and the source to the first non-USD currency available.
        const firstOther =
          data.find((r) => r.currency !== "USD")?.currency ?? data[0].currency;
        const hasUsd = data.some((r) => r.currency === "USD");
        setFrom(firstOther);
        setTo(hasUsd ? "USD" : data[0].currency);
      });
    return () => {
      active = false;
    };
  }, []);

  const result = useMemo(() => {
    const amt = Number.parseFloat(amount);
    if (!rates || !from || !to || !Number.isFinite(amt)) return null;
    const rFrom = rates.find((r) => r.currency === from)?.rate_to_usd;
    const rTo = rates.find((r) => r.currency === to)?.rate_to_usd;
    if (!rFrom || !rTo) return null;
    return (amt * rFrom) / rTo;
  }, [amount, from, to, rates]);

  // "Rates as of <max(updated_at)>" in the viewer's local date.
  const asOf = useMemo(() => {
    if (!rates || rates.length === 0) return null;
    const max = rates.reduce(
      (m, r) => (r.updated_at > m ? r.updated_at : m),
      rates[0].updated_at,
    );
    return new Date(max).toLocaleDateString();
  }, [rates]);

  const selectClass =
    "h-10 min-w-0 flex-1 rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

  return (
    <section className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4">
      <h2 className="text-sm font-medium text-muted">{t("title")}</h2>

      {failed ? (
        <p className="text-sm text-muted">{t("failed")}</p>
      ) : rates === null ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("amount")}</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
            />
          </label>

          <div className="flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm text-body">{t("from")}</span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={selectClass}
              >
                {rates.map((r) => (
                  <option key={r.currency} value={r.currency}>
                    {r.currency}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label={t("swap")}
              title={t("swap")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn border border-hairline text-muted transition-colors hover:text-olive"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
            </button>

            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm text-body">{t("to")}</span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={selectClass}
              >
                {rates.map((r) => (
                  <option key={r.currency} value={r.currency}>
                    {r.currency}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-baseline justify-between gap-2 rounded-input bg-hairline-row/50 px-3 py-2">
            <span className="text-sm text-muted">{t("result")}</span>
            <span className="font-mono text-lg text-olive">
              {result === null ? "—" : `${result.toFixed(2)} ${to}`}
            </span>
          </div>

          {asOf && (
            <p className="text-xs text-faint">{t("asOf", { date: asOf })}</p>
          )}
        </>
      )}
    </section>
  );
}
