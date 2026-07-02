import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import {
  EXPORT_HEADER,
  exportRowToCells,
  getExportRows,
  type ExportFilters,
  type ExportItemType,
  type ExportStatus,
} from "@/lib/data/export";
import { toCsv } from "@/lib/export/csv";

// CSV download endpoint (roadmap #6 slice 1). Route handlers bypass the (console)
// layout gate, so we re-check console access here; RLS is still the real scope
// gate on every query. RLS-respecting client only — no secret client, no writes.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseType(v: string | null): ExportItemType {
  return v === "receipts" || v === "notes" ? v : "both";
}
function parseStatus(v: string | null): ExportStatus {
  return v === "pending" || v === "approved" || v === "rejected" ? v : "all";
}
function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "group"
  );
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!canAccessConsole(user)) {
    return new Response("Forbidden", { status: 403 });
  }

  const p = req.nextUrl.searchParams;
  const groupParam = p.get("group");
  const from = p.get("from");
  const to = p.get("to");
  const filters: ExportFilters = {
    groupId: groupParam && groupParam !== "all" ? groupParam : null,
    from: from && DATE_RE.test(from) ? from : null,
    to: to && DATE_RE.test(to) ? to : null,
    status: parseStatus(p.get("status")),
    type: parseType(p.get("type")),
  };

  const rows = await getExportRows(filters);
  const csv = toCsv([...EXPORT_HEADER], rows.map(exportRowToCells));

  // Filename: export_{group|all}_{from|start}_{to|end}.csv
  let groupLabel = "all";
  if (filters.groupId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("groups")
      .select("name")
      .eq("id", filters.groupId)
      .maybeSingle();
    groupLabel = slug(data?.name ?? "group");
  }
  const filename = `export_${groupLabel}_${filters.from ?? "start"}_${filters.to ?? "end"}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
