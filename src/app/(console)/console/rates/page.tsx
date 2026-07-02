import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getRates } from "@/lib/data/rates";
import { RatesManager } from "./rates-manager";

// Admin-ONLY FX rate editor (roadmap #6 slice 2) — stricter than canAccessConsole,
// mirrors the #7 /console/users gate. Treasurers reach the console but not here.
export default async function RatesPage() {
  const me = await getSessionUser();
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  if (!isAdmin) redirect("/console");

  const [t, { rows, stale, now }] = await Promise.all([
    getTranslations("rates"),
    getRates(),
  ]);

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-muted">{t("intro")}</p>
      </div>

      {stale && (
        <p className="flex items-start gap-2 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-body">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
          {t("staleWarning")}
        </p>
      )}

      <RatesManager rows={rows} now={now} />
    </div>
  );
}
