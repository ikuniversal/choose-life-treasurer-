import { getTranslations } from "next-intl/server";
import { getMyTasks } from "@/lib/data/tasks";
import { MyTasksList } from "./my-tasks-list";

export default async function MyTasksPage() {
  const [t, tasks] = await Promise.all([
    getTranslations("tasks"),
    getMyTasks(),
  ]);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="text-2xl font-bold text-ink">{t("myTitle")}</h1>
      {tasks.length === 0 ? (
        <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
          {t("empty")}
        </p>
      ) : (
        <MyTasksList tasks={tasks} />
      )}
    </div>
  );
}
