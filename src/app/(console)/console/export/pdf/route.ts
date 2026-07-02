import type { NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import {
  getExportRows,
  parseExportFilters,
  slugifyGroup,
} from "@/lib/data/export";
import { renderExpenseReportPdf } from "@/lib/pdf/expense-report";

// PDF download endpoint (roadmap #6 slice 1, PDF). Same filters, same
// RLS-respecting data path (getExportRows: RPC-only names, admin=all/treasurer=own,
// no secret client, zero writes), and the same console-access re-check as the CSV
// route — route handlers bypass the (console) layout gate.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!canAccessConsole(user)) {
    return new Response("Forbidden", { status: 403 });
  }

  const filters = parseExportFilters(req.nextUrl.searchParams);
  const rows = await getExportRows(filters);

  // Per-currency amount sums + USD total (notes have no amount → skipped).
  const byCurrencyMap = new Map<string, number>();
  let usdTotal = 0;
  for (const r of rows) {
    const amt = Number.parseFloat(r.amount);
    if (Number.isFinite(amt)) {
      byCurrencyMap.set(r.currency, (byCurrencyMap.get(r.currency) ?? 0) + amt);
    }
    const usd = Number.parseFloat(r.usdEquivalent);
    if (Number.isFinite(usd)) usdTotal += usd;
  }
  const byCurrency = [...byCurrencyMap.entries()]
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  const t = await getTranslations("exportPdf");

  // Scope label: group name (UGC) or "All groups". Also drives the filename slug.
  let scopeValue = t("allGroups");
  let groupLabel = "all";
  if (filters.groupId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("groups")
      .select("name")
      .eq("id", filters.groupId)
      .maybeSingle();
    scopeValue = data?.name ?? filters.groupId;
    groupLabel = slugifyGroup(data?.name ?? "group");
  }

  const rangeValue =
    filters.from || filters.to
      ? `${filters.from ?? "…"} — ${filters.to ?? "…"}`
      : t("anyRange");
  const generatedValue =
    new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const pdf = await renderExpenseReportPdf(
    rows,
    {
      title: t("title"),
      scopeLabel: t("scope"),
      scopeValue,
      rangeLabel: t("range"),
      rangeValue,
      generatedLabel: t("generated"),
      generatedValue,
    },
    { byCurrency, usdTotal },
    {
      colDate: t("colDate"),
      colSubmitter: t("colSubmitter"),
      colDescription: t("colDescription"),
      colCategory: t("colCategory"),
      colAmount: t("colAmount"),
      colUsd: t("colUsd"),
      colStatus: t("colStatus"),
      late: t("late"),
      dup: t("dup"),
      totals: t("totals"),
      usdTotal: t("usdTotal"),
      empty: t("empty"),
      page: t("page"),
    },
  );

  const filename = `report_${groupLabel}_${filters.from ?? "start"}_${filters.to ?? "end"}.pdf`;

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
