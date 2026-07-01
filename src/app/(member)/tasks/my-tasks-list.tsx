"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { markTaskDone } from "@/lib/task-actions";
import type { MyTask } from "@/lib/data/tasks";

export function MyTasksList({ tasks }: { tasks: MyTask[] }) {
  const t = useTranslations("tasks");
  const tRoles = useTranslations("roles");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
      <ul className="overflow-hidden rounded-card border border-hairline bg-card">
        {tasks.map((task) => (
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
              <span className="font-mono">
                {task.dueDate
                  ? `${t("due")}: ${task.dueDate}`
                  : t("noDue")}
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
