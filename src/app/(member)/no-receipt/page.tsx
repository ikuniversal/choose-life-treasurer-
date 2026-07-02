import { getTranslations } from "next-intl/server";
import { getMemberGroups } from "@/lib/data/member-groups";
import { NoteForm } from "./note-form";

export default async function NoReceiptPage() {
  const [t, groups] = await Promise.all([
    getTranslations("notes"),
    getMemberGroups(),
  ]);

  // Server "today" (UTC) for the deadline-passed nudge — matches the DB trigger's
  // server-side is_late stamping.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="text-lg font-semibold text-ink">{t("title")}</h1>
      {groups.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("noGroup")}
        </p>
      ) : (
        <NoteForm groups={groups} today={today} />
      )}
    </div>
  );
}
