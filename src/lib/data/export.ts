import { createClient } from "@/lib/supabase/server";

// Console export data (roadmap #6 slice 1). Everything runs on the RLS-respecting
// server client — RLS is the scope gate (admin → all, treasurer → own groups), so
// the secret admin client is NEVER touched here. Submitter names resolve ONLY via
// the get_group_member_names RPC (never a widened profiles SELECT — §8).

export type ExportItemType = "receipts" | "notes" | "both";
export type ExportStatus = "all" | "pending" | "approved" | "rejected";

export interface ExportFilters {
  /** null = all RLS-visible groups. */
  groupId: string | null;
  /** yyyy-mm-dd inclusive lower bound on the item date, or null. */
  from: string | null;
  /** yyyy-mm-dd inclusive upper bound on the item date, or null. */
  to: string | null;
  status: ExportStatus;
  type: ExportItemType;
}

// One flat, ordered record per exported item. UGC fields are verbatim.
export interface ExportRow {
  type: string;
  project: string;
  group: string;
  submitter: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  currency: string;
  usdEquivalent: string;
  status: string;
  isLate: string;
  isDuplicate: string;
  rejectReason: string;
  createdAt: string;
}

// Fixed, machine-stable CSV column order (NOT translated — downstream parsers and
// Excel rely on these header keys).
export const EXPORT_HEADER = [
  "type",
  "project",
  "group",
  "submitter",
  "date",
  "vendor_description",
  "category",
  "amount",
  "currency",
  "usd_equivalent",
  "status",
  "is_late",
  "is_duplicate",
  "reject_reason",
  "created_at",
] as const;

type GroupEmbed = { name: string | null; projects: { name: string | null } | null } | null;

function projectName(g: GroupEmbed): string {
  return g?.projects?.name ?? "";
}
function groupName(g: GroupEmbed): string {
  return g?.name ?? "";
}

// Resolve submitter display names for every group present in the result set, via
// the sanctioned RPC only. One call per distinct group; "" when unresolved.
async function resolveNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  await Promise.all(
    [...new Set(groupIds)].map(async (gid) => {
      const { data } = await supabase.rpc("get_group_member_names", {
        p_group_id: gid,
      });
      for (const m of data ?? []) names.set(m.user_id, m.full_name);
    }),
  );
  return names;
}

export async function getExportRows(
  filters: ExportFilters,
): Promise<ExportRow[]> {
  const supabase = await createClient();
  const wantReceipts = filters.type === "receipts" || filters.type === "both";
  const wantNotes = filters.type === "notes" || filters.type === "both";

  const rows: ExportRow[] = [];
  const groupIds: string[] = [];

  if (wantReceipts) {
    let q = supabase
      .from("receipts")
      .select(
        "id, group_id, submitted_by, receipt_date, vendor, category, amount, currency, usd_equivalent, status, is_late, is_duplicate, reject_reason, created_at, groups(name, projects(name))",
      );
    if (filters.groupId) q = q.eq("group_id", filters.groupId);
    if (filters.status !== "all") q = q.eq("status", filters.status);
    if (filters.from) q = q.gte("receipt_date", filters.from);
    if (filters.to) q = q.lte("receipt_date", filters.to);
    q = q.is("deleted_at", null); // exclude soft-deleted receipts from exports
    q = q.order("created_at", { ascending: false });

    const { data } = await q;
    for (const r of data ?? []) {
      const g = r.groups as GroupEmbed;
      groupIds.push(r.group_id);
      rows.push({
        type: "receipt",
        project: projectName(g),
        group: groupName(g),
        submitter: r.submitted_by, // filled after names resolve
        date: r.receipt_date,
        description: r.vendor,
        category: r.category,
        amount: r.amount === null ? "" : String(r.amount),
        currency: r.currency,
        usdEquivalent: r.usd_equivalent === null ? "" : String(r.usd_equivalent),
        status: r.status,
        isLate: String(r.is_late),
        isDuplicate: String(r.is_duplicate),
        rejectReason: r.reject_reason ?? "",
        createdAt: r.created_at,
      });
    }
  }

  if (wantNotes) {
    let q = supabase
      .from("no_receipt_notes")
      .select(
        "id, group_id, submitted_by, note_date, description, status, is_late, reject_reason, created_at, groups(name, projects(name))",
      );
    if (filters.groupId) q = q.eq("group_id", filters.groupId);
    if (filters.status !== "all") q = q.eq("status", filters.status);
    if (filters.from) q = q.gte("note_date", filters.from);
    if (filters.to) q = q.lte("note_date", filters.to);
    q = q.is("deleted_at", null); // exclude soft-deleted notes from exports
    q = q.order("created_at", { ascending: false });

    const { data } = await q;
    for (const n of data ?? []) {
      const g = n.groups as GroupEmbed;
      groupIds.push(n.group_id);
      rows.push({
        type: "note",
        project: projectName(g),
        group: groupName(g),
        submitter: n.submitted_by,
        date: n.note_date,
        description: n.description,
        category: "",
        amount: "",
        currency: "",
        usdEquivalent: "",
        status: n.status,
        isLate: String(n.is_late),
        isDuplicate: "false",
        rejectReason: n.reject_reason ?? "",
        createdAt: n.created_at,
      });
    }
  }

  // Swap submitter ids → names via the RPC (id left verbatim only if unresolved).
  const names = await resolveNames(supabase, groupIds);
  for (const row of rows) {
    row.submitter = names.get(row.submitter) ?? "";
  }

  return rows;
}

// Shared filter parsing for the export route handlers (CSV + PDF), so the two
// download endpoints never diverge on how they read the same form.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseExportFilters(p: URLSearchParams): ExportFilters {
  const group = p.get("group");
  const from = p.get("from");
  const to = p.get("to");
  const type = p.get("type");
  const status = p.get("status");
  return {
    groupId: group && group !== "all" ? group : null,
    from: from && DATE_RE.test(from) ? from : null,
    to: to && DATE_RE.test(to) ? to : null,
    status:
      status === "pending" || status === "approved" || status === "rejected"
        ? status
        : "all",
    type: type === "receipts" || type === "notes" ? type : "both",
  };
}

// Filesystem-safe slug of a group name for download filenames.
export function slugifyGroup(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "group"
  );
}

// Ordered CSV cell values for one row, matching EXPORT_HEADER.
export function exportRowToCells(r: ExportRow): string[] {
  return [
    r.type,
    r.project,
    r.group,
    r.submitter,
    r.date,
    r.description,
    r.category,
    r.amount,
    r.currency,
    r.usdEquivalent,
    r.status,
    r.isLate,
    r.isDuplicate,
    r.rejectReason,
    r.createdAt,
  ];
}
