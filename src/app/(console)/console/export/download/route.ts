import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import {
  EXPORT_HEADER,
  exportRowToCells,
  getExportRows,
  parseExportFilters,
  slugifyGroup,
} from "@/lib/data/export";
import { toCsv } from "@/lib/export/csv";

// CSV download endpoint (roadmap #6 slice 1). Route handlers bypass the (console)
// layout gate, so we re-check console access here; RLS is still the real scope
// gate on every query. RLS-respecting client only — no secret client, no writes.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!canAccessConsole(user)) {
    return new Response("Forbidden", { status: 403 });
  }

  const filters = parseExportFilters(req.nextUrl.searchParams);
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
    groupLabel = slugifyGroup(data?.name ?? "group");
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
