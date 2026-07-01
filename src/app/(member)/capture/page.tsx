import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { CaptureForm } from "./capture-form";

export default async function CapturePage() {
  const [t, user, supabase] = await Promise.all([
    getTranslations("capture"),
    getSessionUser(),
    createClient(),
  ]);

  const { data: fx } = await supabase
    .from("fx_rates")
    .select("currency")
    .order("currency");
  const currencies = (fx ?? []).map((r) => r.currency);

  // Distinct groups the user belongs to (a receipt is filed against one of them).
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
        <CaptureForm groups={groups} currencies={currencies} />
      )}
    </div>
  );
}
