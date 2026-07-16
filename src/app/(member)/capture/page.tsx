import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getAllGroupsForCapture, getMemberGroups } from "@/lib/data/member-groups";
import { CaptureForm } from "./capture-form";

export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const [t, supabase, me, sp] = await Promise.all([
    getTranslations("capture"),
    createClient(),
    getSessionUser(),
    searchParams,
  ]);

  // Admins may file into ANY group (#16 — group chosen at capture time); members
  // keep their own-group flow unchanged.
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  const groups = isAdmin
    ? await getAllGroupsForCapture()
    : await getMemberGroups();

  const { data: fx } = await supabase
    .from("fx_rates")
    .select("currency")
    .order("currency");
  const currencies = (fx ?? []).map((r) => r.currency);

  // Deep-link from the group-expenses "Add receipt" button (?group=<id>, #72):
  // pre-select that group in the picker if it's in scope; ignore unknown/out-of-
  // scope ids → the normal default. Never a new group the viewer can't file into.
  const defaultGroup =
    sp.group && groups.some((g) => g.id === sp.group) ? sp.group : undefined;

  // Server "today" (UTC) for the deadline-passed nudge — aligns with how the DB
  // trigger stamps is_late server-side.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="text-lg font-semibold text-ink">{t("title")}</h1>
      {groups.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("noGroup")}
        </p>
      ) : (
        <CaptureForm
          groups={groups}
          currencies={currencies}
          today={today}
          defaultGroup={defaultGroup}
        />
      )}
    </div>
  );
}
