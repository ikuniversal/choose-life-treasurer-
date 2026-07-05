import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { getAllGroupsForCapture, getMemberGroups } from "@/lib/data/member-groups";
import { CaptureForm } from "./capture-form";

export default async function CapturePage() {
  const [t, supabase, me] = await Promise.all([
    getTranslations("capture"),
    createClient(),
    getSessionUser(),
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
        <CaptureForm groups={groups} currencies={currencies} today={today} />
      )}
    </div>
  );
}
