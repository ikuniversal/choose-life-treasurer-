import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { NoteForm } from "./note-form";

export default async function NoReceiptPage() {
  const [t, user] = await Promise.all([
    getTranslations("notes"),
    getSessionUser(),
  ]);

  // Same group rule as /capture: a member files against one of their groups; an
  // org-wide admin (group_id null) has no group and sees the no-group state.
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
      {groups.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("noGroup")}
        </p>
      ) : (
        <NoteForm groups={groups} />
      )}
    </div>
  );
}
