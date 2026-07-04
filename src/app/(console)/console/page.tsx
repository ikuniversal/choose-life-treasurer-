import { getTranslations } from "next-intl/server";
import { CurrencyConverter } from "@/components/currency-converter";
import { StatCard } from "@/components/stat-card";

export default async function ConsoleHomePage() {
  const t = await getTranslations("console");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Stat grid (reskin) — reuses the shared StatCard. Pending review is a
          "watch" stat, so it takes the gold tone. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label={t("pendingReview")} value="0" tone="gold" />
      </div>

      {/* Same read-only FX converter members use — handy during review. */}
      <div className="max-w-sm">
        <CurrencyConverter />
      </div>
    </div>
  );
}
