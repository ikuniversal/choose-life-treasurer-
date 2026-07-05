import { getTranslations } from "next-intl/server";
import {
  getConsoleGroups,
  getGroupTasksAndRoster,
  type ConsoleTask,
  type RosterMember,
} from "@/lib/data/tasks";
import { TasksConsole } from "./tasks-console";

// (console) layout already gates to treasurer/admin; RLS scopes the group list
// (admin → all, treasurer → own). Selected group comes from ?group=.
export default async function ConsoleTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const [t, sp, groups] = await Promise.all([
    getTranslations("tasks"),
    searchParams,
    getConsoleGroups(),
  ]);

  const selectedGroup =
    (sp.group && groups.some((g) => g.id === sp.group)
      ? sp.group
      : groups[0]?.id) ?? null;

  let tasks: ConsoleTask[] = [];
  let roster: RosterMember[] = [];
  if (selectedGroup) {
    const data = await getGroupTasksAndRoster(selectedGroup);
    tasks = data.tasks;
    roster = data.roster;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">{t("consoleTitle")}</h1>
      {groups.length === 0 ? (
        <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
          {t("noGroups")}
        </p>
      ) : (
        <TasksConsole
          groups={groups}
          selectedGroup={selectedGroup ?? ""}
          tasks={tasks}
          roster={roster}
        />
      )}
    </div>
  );
}
