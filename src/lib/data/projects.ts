import { createClient } from "@/lib/supabase/server";

export interface GroupRow {
  id: string;
  name: string;
  spendingLimit: number | null;
  submissionDeadline: string | null;
  /** data-bearing children under RESTRICT — a group with any of these cannot be deleted. */
  receiptCount: number;
  noteCount: number;
  taskCount: number;
}

export interface ProjectRow {
  id: string;
  name: string;
  groups: GroupRow[];
}

function tally(rows: { group_id: string }[] | null): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows ?? []) m.set(r.group_id, (m.get(r.group_id) ?? 0) + 1);
  return m;
}

// All projects with their groups + per-group counts of the RESTRICT children
// (receipts / notes / tasks), so the delete UI can guard before asking the DB.
// RLS-respecting client; admin read is covered by existing policies. Names are
// UGC — never translated.
export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, groups(id, name, spending_limit, submission_deadline)")
    .order("name");

  const projects = data ?? [];
  const groupIds = projects.flatMap((p) => (p.groups ?? []).map((g) => g.id));

  const [receiptsRes, notesRes, tasksRes] = await Promise.all([
    supabase.from("receipts").select("group_id").in("group_id", groupIds),
    supabase.from("no_receipt_notes").select("group_id").in("group_id", groupIds),
    supabase.from("tasks").select("group_id").in("group_id", groupIds),
  ]);
  const receiptsBy = tally(receiptsRes.data);
  const notesBy = tally(notesRes.data);
  const tasksBy = tally(tasksRes.data);

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    groups: (p.groups ?? [])
      .map((g) => ({
        id: g.id,
        name: g.name,
        spendingLimit: g.spending_limit,
        submissionDeadline: g.submission_deadline,
        receiptCount: receiptsBy.get(g.id) ?? 0,
        noteCount: notesBy.get(g.id) ?? 0,
        taskCount: tasksBy.get(g.id) ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
