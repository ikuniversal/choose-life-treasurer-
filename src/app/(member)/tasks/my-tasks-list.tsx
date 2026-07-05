"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { markTaskDone } from "@/lib/task-actions";
import type { MyTask, TaskStatus } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

// Canonical order for the filter row — only statuses actually present are shown.
const STATUS_ORDER: TaskStatus[] = ["assigned", "done", "approved"];

export function MyTasksList({ tasks }: { tasks: MyTask[] }) {
  const t = useTranslations("tasks");
  const tStatus = useTranslations("taskStatus");
  const tRoles = useTranslations("roles");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const options = useMemo(() => {
    const present = STATUS_ORDER.filter((s) => tasks.some((x) => x.status === s));
    return [
      { value: "all", label: t("all"), count: tasks.length },
      ...present.map((s) => ({
        value: s,
        label: tStatus(s),
        count: tasks.filter((x) => x.status === s).length,
      })),
    ];
  }, [tasks, t, tStatus]);

  const visible =
    filter === "all" ? tasks : tasks.filter((x) => x.status === filter);

  function done(id: string) {
    setError(null);
    startTransition(async () => {
      const r = await markTaskDone(id);
      if (r.error) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-reject">{t(error)}</p>}

      {/* Reskin: status filter pills (same pill language as the console nav). */}
      {options.length > 2 && (
        <div
          role="tablist"
          aria-label={t("myTitle")}
          className="flex gap-2 overflow-x-auto"
        >
          {options.map((o) => {
            const active = o.value === filter;
            return (
              <button
                key={o.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(o.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-white"
                    : "bg-hairline-row text-body hover:bg-hairline",
                )}
              >
                {o.label}
                <span
                  className={cn(
                    "num text-xs",
                    active ? "text-white/70" : "text-muted",
                  )}
                >
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
        {visible.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              {/* title is UGC — never translated */}
              <p className="min-w-0 text-sm font-medium text-ink">
                {task.title}
              </p>
              <TaskStatusBadge status={task.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="num">
                {task.dueDate ? `${t("due")}: ${task.dueDate}` : t("noDue")}
              </span>
              <span>
                · {t("createdBy")}: {task.creatorName ?? tRoles("admin")}
              </span>
            </div>
            {task.status === "assigned" && (
              <div>
                <Button
                  variant="approve"
                  size="sm"
                  disabled={pending}
                  onClick={() => done(task.id)}
                >
                  {t("markDone")}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
