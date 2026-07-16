import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Plus } from "lucide-react";
import { getSessionUser, isOrgAdmin } from "@/lib/auth";
import { getGroupActivity } from "@/lib/data/group-activity";
import { GroupActivityList } from "./group-activity-list";

// Browsable expense view for one group (revise of #65 export-link). The (console)
// layout already gates to console roles; getGroupActivity returns null when the
// group isn't visible to the viewer (RLS) → 404. Admin, treasurer, and project
// admin all see their real data (migration #22 SELECT policies).
export default async function GroupExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [t, activity, me] = await Promise.all([
    getTranslations("groupExpenses"),
    getGroupActivity(id),
    getSessionUser(),
  ]);
  if (!activity) notFound();

  // Admin-only "Add receipt" affordance — deep-links into /capture with this
  // group pre-selected (admin any-group insert, #60). Treasurer/project_admin
  // don't get it here (capture is the admin's group-picker flow).
  const isAdmin = isOrgAdmin(me);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/console"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("back")}
      </Link>

      {/* project + group names are UGC — never translated */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {activity.projectName && (
            <span className="text-xs font-semibold uppercase tracking-wide text-amber">
              {activity.projectName}
            </span>
          )}
          <h1 className="text-2xl font-bold text-ink">{activity.groupName}</h1>
        </div>
        {isAdmin && (
          <Link
            href={`/capture?group=${activity.groupId}`}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-btn bg-olive px-4 text-sm font-medium text-canvas transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("addReceipt")}
          </Link>
        )}
      </header>

      <GroupActivityList
        receipts={activity.receipts}
        notes={activity.notes}
      />
    </div>
  );
}
