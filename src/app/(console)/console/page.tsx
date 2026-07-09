import { getTranslations } from "next-intl/server";
import { CurrencyConverter } from "@/components/currency-converter";
import { StatCard } from "@/components/stat-card";
import { SummaryCard } from "@/components/console/summary-card";
import { getDashboard } from "@/lib/data/dashboard";
import { getSessionUser, isOrgAdmin } from "@/lib/auth";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function ConsoleHomePage() {
  const [t, { stats, groups }, me] = await Promise.all([
    getTranslations("dashboard"),
    getDashboard(),
    getSessionUser(),
  ]);

  // A project_admin sees ONLY their project's SummaryCards — no org-wide totals
  // (migration #20 gives them no receipts read, so those stats aren't theirs to
  // see). Admins/treasurers keep the full stat grid.
  const isAdmin = isOrgAdmin(me);
  const isTreasurer = !!me && me.assignments.some((a) => a.role === "treasurer");
  const isProjectAdmin =
    !!me && me.assignments.some((a) => a.role === "project_admin");
  const showOrgStats = isAdmin || isTreasurer || !isProjectAdmin;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>

      {/* Reskin stat grid — shared StatCard, real read-only aggregates. */}
      {showOrgStats && (
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
      )}

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
