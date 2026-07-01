import { getTranslations } from "next-intl/server";
import { getConsoleGroups } from "@/lib/data/tasks";
import { ChatSurface } from "@/components/chat-surface";

// (console) layout gates to treasurer/admin; getConsoleGroups is RLS-scoped
// (admin → all, treasurer → own).
export default async function ConsoleChatPage() {
  const [t, groups] = await Promise.all([
    getTranslations("chat"),
    getConsoleGroups(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
      <ChatSurface groups={groups} />
    </div>
  );
}
