import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export interface MemberGroup {
  id: string;
  /** group name — UGC, never translated. */
  name: string;
  /** submission_deadline (yyyy-mm-dd) or null. */
  deadline: string | null;
}

// Distinct groups the signed-in member belongs to, with each group's submission
// deadline (for the /capture + /no-receipt deadline notices). RLS-respecting
// client — groups_select lets a member read their own groups.
export async function getMemberGroups(): Promise<MemberGroup[]> {
  const user = await getSessionUser();

  const seen = new Set<string>();
  const ids: string[] = [];
  const nameById = new Map<string, string>();
  for (const a of user?.assignments ?? []) {
    if (a.groupId && !seen.has(a.groupId)) {
      seen.add(a.groupId);
      ids.push(a.groupId);
      nameById.set(a.groupId, a.groupName ?? a.groupId);
    }
  }
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id, submission_deadline")
    .in("id", ids);
  const deadlineById = new Map(
    (data ?? []).map((g) => [g.id, g.submission_deadline]),
  );

  return ids.map((id) => ({
    id,
    name: nameById.get(id) ?? id,
    deadline: deadlineById.get(id) ?? null,
  }));
}

// ALL groups, labeled "Project · Group", for the ADMIN capture picker (#16 —
// admins may file a receipt into any group). RLS-respecting client: an admin
// sees every project/group. Group + project names are UGC — never translated.
export async function getAllGroupsForCapture(): Promise<MemberGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("name, groups(id, name, submission_deadline)")
    .order("name");

  const out: MemberGroup[] = [];
  for (const p of data ?? []) {
    for (const g of p.groups ?? []) {
      out.push({
        id: g.id,
        name: `${p.name} · ${g.name}`,
        deadline: g.submission_deadline,
      });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
