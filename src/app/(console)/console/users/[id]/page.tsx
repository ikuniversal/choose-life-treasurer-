import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getUserActivity } from "@/lib/data/user-activity";
import { StatusPill } from "@/components/status-pill";
import { LateBadge } from "@/components/late-badge";
import { DuplicateBadge } from "@/components/duplicate-badge";

export default async function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Admin-only (defensive — the users list link only shows for admins).
  const me = await getSessionUser();
  if (!me || !me.assignments.some((a) => a.role === "admin")) {
    redirect("/console");
  }

  const [t, tStatus, activity] = await Promise.all([
    getTranslations("users"),
    getTranslations("status"),
    getUserActivity(id),
  ]);
  if (!activity) notFound();

  const emptyBox = (
    <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
      {t("noActivity")}
    </p>
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/console/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("title")}
      </Link>

      {/* name + email are UGC — never translated */}
      <header className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold text-ink">
          {activity.fullName ?? activity.email ?? activity.userId}
        </h1>
        {activity.email && (
          <p className="num text-sm text-muted">{activity.email}</p>
        )}
      </header>

      {activity.receipts.length === 0 && activity.notes.length === 0 ? (
        emptyBox
      ) : (
        <>
          {activity.receipts.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted">
                {t("receiptsSection")}
              </h2>
              <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
                {activity.receipts.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 border-b border-hairline-row px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {r.vendor}
                      </p>
                      <p className="num text-xs text-faint">
                        {r.date}
                        {r.groupName && (
                          <span className="text-muted"> · {r.groupName}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="num text-sm text-olive">
                        {r.amount.toFixed(2)} {r.currency}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {r.isDuplicate && <DuplicateBadge />}
                        {r.isLate && <LateBadge />}
                        <StatusPill status={r.status} label={tStatus(r.status)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activity.notes.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted">
                {t("notesSection")}
              </h2>
              <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
                {activity.notes.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center justify-between gap-3 border-b border-hairline-row px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {n.description}
                      </p>
                      <p className="num text-xs text-faint">
                        {n.date}
                        {n.groupName && (
                          <span className="text-muted"> · {n.groupName}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {n.isLate && <LateBadge />}
                      <StatusPill status={n.status} label={tStatus(n.status)} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
