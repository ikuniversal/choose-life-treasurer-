import { createClient } from "@/lib/supabase/server";

export interface GroupRow {
  id: string;
  name: string;
  spendingLimit: number | null;
  submissionDeadline: string | null;
}

export interface ProjectRow {
  id: string;
  name: string;
  groups: GroupRow[];
}

// All projects with their groups. RLS-respecting client; admin read is covered
// by existing policies. Names are UGC — never translated.
export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name, groups(id, name, spending_limit, submission_deadline)")
    .order("name");

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    groups: (p.groups ?? [])
      .map((g) => ({
        id: g.id,
        name: g.name,
        spendingLimit: g.spending_limit,
        submissionDeadline: g.submission_deadline,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
