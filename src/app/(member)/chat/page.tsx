import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { ChatSurface } from "@/components/chat-surface";

export default async function MemberChatPage() {
  const [t, user] = await Promise.all([
    getTranslations("chat"),
    getSessionUser(),
  ]);

  const seen = new Set<string>();
  const groups: { id: string; name: string }[] = [];
  for (const a of user?.assignments ?? []) {
    if (a.groupId && !seen.has(a.groupId)) {
      seen.add(a.groupId);
      groups.push({ id: a.groupId, name: a.groupName ?? a.groupId });
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="text-lg font-semibold text-ink">{t("title")}</h1>
      <ChatSurface groups={groups} />
    </div>
  );
}
