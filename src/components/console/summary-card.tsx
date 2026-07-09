"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { GroupSummary } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

// Reskin: per-group budget summary card. Project label + status pill on top;
// bold group name; spent / of-limit; gold progress bar (terracotta when over
// 100%); footer = deadline + group treasurer. A null limit shows spend only,
// no bar. Spend = approved, non-deleted usd (v1 definition, dashboard.ts).
//
// The whole card is a LINK into this group's expenses: it opens the existing
// /console/export surface with this group pre-selected in its group filter (all
// statuses, receipts + notes) — no new route/query/RLS, just the group URL param.
export function SummaryCard({ group }: { group: GroupSummary }) {
  const t = useTranslations("dashboard");
  const limit = group.spendingLimit;
  const hasLimit = limit != null;
  const pct = hasLimit && limit > 0 ? Math.min(100, Math.round((group.spent / limit) * 100)) : 0;

  return (
    <Link
      href={`/console/export?group=${group.id}`}
      aria-label={t("viewGroupExpenses", { group: group.name })}
      className="group/card flex flex-col gap-2 rounded-card-lg bg-card p-5 shadow-card transition hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/40"
    >
      <div className="flex items-start justify-between gap-2">
        {/* project name is UGC — never translated */}
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-amber">
          {group.projectName}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {group.overBudget ? (
            <span className="inline-flex items-center rounded-pill bg-status-rejected-dot px-2.5 py-0.5 text-xs font-semibold text-white">
              {t("over")}
            </span>
          ) : group.submissionDeadline ? (
            <span className="inline-flex items-center rounded-pill bg-status-pending-dot px-2.5 py-0.5 text-xs font-semibold text-white">
              {t("due", { date: group.submissionDeadline })}
            </span>
          ) : null}
          {/* affordance: the card navigates to this group's expenses */}
          <ChevronRight
            className="h-4 w-4 text-muted transition-transform group-hover/card:translate-x-0.5"
            aria-hidden
          />
        </div>
      </div>

      {/* group name is UGC — never translated */}
      <p className="truncate text-base font-bold text-ink">{group.name}</p>

      <div className="flex items-baseline justify-end gap-1.5">
        <span className="num text-lg font-bold text-ink">{money(group.spent)}</span>
        {hasLimit && (
          <span className="num text-sm text-muted">
            {t("of", { limit: money(limit) })}
          </span>
        )}
      </div>

      {hasLimit && (
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-hairline-row">
          <div
            className={cn(
              "h-full rounded-pill",
              group.overBudget ? "bg-status-rejected-dot" : "bg-amber",
            )}
            style={{ width: `${group.overBudget ? 100 : pct}%` }}
          />
        </div>
      )}

      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
        <span className="num">
          {group.submissionDeadline
            ? t("deadline", { date: group.submissionDeadline })
            : t("noDeadline")}
        </span>
        {/* treasurer name is UGC — never translated */}
        {group.treasurerName && (
          <span className="truncate">{group.treasurerName}</span>
        )}
      </div>
    </Link>
  );
}
