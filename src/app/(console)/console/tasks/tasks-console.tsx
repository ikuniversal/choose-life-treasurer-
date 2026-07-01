"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { approveTask, createTask } from "@/lib/task-actions";
import type {
  ConsoleTask,
  GroupOption,
  RosterMember,
} from "@/lib/data/tasks";

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

export function TasksConsole({
  groups,
  selectedGroup,
  tasks,
  roster,
}: {
  groups: GroupOption[];
  selectedGroup: string;
  tasks: ConsoleTask[];
  roster: RosterMember[];
}) {
  const t = useTranslations("tasks");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await action();
      if (r?.error) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("group")}</span>
        <select
          value={selectedGroup}
          onChange={(e) =>
            router.push(`/console/tasks?group=${e.target.value}`)
          }
          className={inputCls}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      {/* Create task */}
      {roster.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-4 text-sm text-muted">
          {t("noRoster")}
        </p>
      ) : (
        <form
          action={(fd) => run(() => createTask(fd))}
          className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4"
        >
          <h2 className="text-sm font-medium text-ink">{t("newTask")}</h2>
          <input type="hidden" name="groupId" value={selectedGroup} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("title")}</span>
            <input name="title" required className={inputCls} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("assignee")}</span>
              <select name="assignee" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  —
                </option>
                {roster.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-body">{t("dueDate")}</span>
              <input name="dueDate" type="date" className={inputCls} />
            </label>
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              {pending ? t("creating") : t("create")}
            </Button>
          </div>
        </form>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-card border border-hairline bg-card">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-ink">
                  {task.title}
                </p>
                <TaskStatusBadge status={task.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <span>
                  {t("assignee")}: {task.assigneeName ?? "—"}
                </span>
                <span className="font-mono">
                  ·{" "}
                  {task.dueDate ? `${t("due")}: ${task.dueDate}` : t("noDue")}
                </span>
              </div>
              {task.status === "done" && (
                <div>
                  <Button
                    variant="approve"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => approveTask(task.id))}
                  >
                    {t("approve")}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
