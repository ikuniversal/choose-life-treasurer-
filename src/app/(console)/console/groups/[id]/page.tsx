import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
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
  const [t, activity] = await Promise.all([
    getTranslations("groupExpenses"),
    getGroupActivity(id),
  ]);
  if (!activity) notFound();

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
      <header className="flex flex-col gap-0.5">
        {activity.projectName && (
          <span className="text-xs font-semibold uppercase tracking-wide text-amber">
            {activity.projectName}
          </span>
        )}
        <h1 className="text-2xl font-bold text-ink">{activity.groupName}</h1>
      </header>

      <GroupActivityList
        receipts={activity.receipts}
        notes={activity.notes}
      />
    </div>
  );
}
