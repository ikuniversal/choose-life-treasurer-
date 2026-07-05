import { getTranslations } from "next-intl/server";
import { CurrencyConverter } from "@/components/currency-converter";
import { StatCard } from "@/components/stat-card";
import { SummaryCard } from "@/components/console/summary-card";
import { getDashboard } from "@/lib/data/dashboard";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function ConsoleHomePage() {
  const [t, { stats, groups }] = await Promise.all([
    getTranslations("dashboard"),
    getDashboard(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Reskin stat grid — shared StatCard, real read-only aggregates. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("submitted")} value={money(stats.submittedUsd)} />
        <StatCard
          label={t("awaitingReview")}
          value={stats.awaitingReview}
          tone="gold"
        />
        <StatCard
          label={t("overBudget")}
          value={stats.groupsOverBudget}
          tone={stats.groupsOverBudget > 0 ? "danger" : "default"}
        />
        <StatCard label={t("activeProjects")} value={stats.activeProjects} />
      </div>

      {groups.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted">{t("groupsTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <SummaryCard key={g.id} group={g} />
            ))}
          </div>
        </section>
      )}

      {/* Same read-only FX converter members use — handy during review. */}
      <div className="max-w-sm">
        <CurrencyConverter />
      </div>
    </div>
  );
}
