import { getTranslations } from "next-intl/server";
import { getConsoleGroups } from "@/lib/data/tasks";

// CSV export (roadmap #6 slice 1). The (console) layout already gates this to
// treasurer/admin; the download route re-checks and RLS scopes the data. A plain
// GET form (no client JS) submits the filters to the download endpoint, which
// returns the file as an attachment. Group options are RLS-scoped (admin → all,
// treasurer → own). Group names are UGC — never translated.
export default async function ExportPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const [t, sp, groups] = await Promise.all([
    getTranslations("export"),
    searchParams,
    getConsoleGroups(),
  ]);

  // Arriving from a dashboard group card (?group=<id>) pre-selects that group in
  // the existing filter, so the view lands scoped to just that group (all
  // statuses). Ignore an unknown/out-of-scope id → fall back to "all".
  const defaultGroup =
    sp.group && groups.some((g) => g.id === sp.group) ? sp.group : "all";

  const fieldClass =
    "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";
  const labelClass = "flex flex-col gap-1.5";
  const labelText = "text-sm text-body";

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-muted">{t("intro")}</p>
      </div>

      <form
        method="GET"
        action="/console/export/download"
        className="flex flex-col gap-4 rounded-card-lg bg-card p-5 shadow-card"
      >
        <label className={labelClass}>
          <span className={labelText}>{t("group")}</span>
          <select name="group" defaultValue={defaultGroup} className={fieldClass}>
            <option value="all">{t("allGroups")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <label className={`${labelClass} flex-1`}>
            <span className={labelText}>{t("dateFrom")}</span>
            <input type="date" name="from" className={fieldClass} />
          </label>
          <label className={`${labelClass} flex-1`}>
            <span className={labelText}>{t("dateTo")}</span>
            <input type="date" name="to" className={fieldClass} />
          </label>
        </div>

        <label className={labelClass}>
          <span className={labelText}>{t("status")}</span>
          <select name="status" defaultValue="all" className={fieldClass}>
            <option value="all">{t("statusAll")}</option>
            <option value="pending">{t("statusPending")}</option>
            <option value="approved">{t("statusApproved")}</option>
            <option value="rejected">{t("statusRejected")}</option>
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelText}>{t("type")}</span>
          <select name="type" defaultValue="both" className={fieldClass}>
            <option value="both">{t("typeBoth")}</option>
            <option value="receipts">{t("typeReceipts")}</option>
            <option value="notes">{t("typeNotes")}</option>
          </select>
        </label>

        {/* Two submit buttons share the same filters via formAction. */}
        <div className="mt-1 flex gap-2">
          <button
            type="submit"
            formAction="/console/export/download"
            className="h-10 rounded-btn bg-olive px-4 text-sm font-medium text-canvas"
          >
            {t("download")}
          </button>
          <button
            type="submit"
            formAction="/console/export/pdf"
            className="h-10 rounded-btn border border-hairline bg-card px-4 text-sm font-medium text-body hover:bg-hairline-row"
          >
            {t("downloadPdf")}
          </button>
        </div>
      </form>
    </div>
  );
}
