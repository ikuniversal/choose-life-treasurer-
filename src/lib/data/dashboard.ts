import { createClient } from "@/lib/supabase/server";

// Console dashboard read model (reskin 2/3). All reads run on the RLS-respecting
// client — a console viewer sees exactly their groups (admin=all, treasurer=own),
// so these aggregates are already scope-correct. Names resolve ONLY via the
// get_group_member_names RPC (never a widened profiles SELECT — §8).

export interface GroupSummary {
  id: string;
  name: string;
  projectName: string;
  /** approved, non-deleted usd_equivalent sum (v1 spend definition). */
  spent: number;
  spendingLimit: number | null;
  submissionDeadline: string | null;
  treasurerName: string | null;
  overBudget: boolean;
}

export interface DashboardData {
  stats: {
    /** non-rejected, non-deleted usd_equivalent sum (org-wide, viewer scope). */
    submittedUsd: number;
    /** pending receipts + pending notes awaiting review. */
    awaitingReview: number;
    /** groups whose approved spend exceeds a set (non-null) limit. */
    groupsOverBudget: number;
    /** projects that have at least one visible group. */
    activeProjects: number;
  };
  groups: GroupSummary[];
}

export async function getDashboard(): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, groups(id, name, spending_limit, submission_deadline)")
    .order("name");
  const projects = projectsData ?? [];

  const groupsFlat = projects.flatMap((p) =>
    (p.groups ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      projectName: p.name,
      spendingLimit: g.spending_limit,
      submissionDeadline: g.submission_deadline,
    })),
  );
  const groupIds = groupsFlat.map((g) => g.id);

  const empty: DashboardData = {
    stats: {
      submittedUsd: 0,
      awaitingReview: 0,
      groupsOverBudget: 0,
      activeProjects: projects.filter((p) => (p.groups ?? []).length > 0).length,
    },
    groups: [],
  };
  if (groupIds.length === 0) return empty;

  // One receipts read drives both per-group spend and the org-wide stats.
  const [receiptsRes, notesRes, treasurerRes] = await Promise.all([
    supabase
      .from("receipts")
      .select("group_id, usd_equivalent, status")
      .in("group_id", groupIds)
      .is("deleted_at", null),
    supabase
      .from("no_receipt_notes")
      .select("id", { count: "exact", head: true })
      .in("group_id", groupIds)
      .eq("status", "pending")
      .is("deleted_at", null),
    supabase
      .from("user_roles")
      .select("user_id, group_id")
      .eq("role", "treasurer")
      .in("group_id", groupIds),
  ]);

  const spentBy = new Map<string, number>();
  let submittedUsd = 0;
  let pendingReceipts = 0;
  for (const r of receiptsRes.data ?? []) {
    const usd = r.usd_equivalent ?? 0;
    if (r.status !== "rejected") submittedUsd += usd;
    if (r.status === "pending") pendingReceipts += 1;
    if (r.status === "approved") {
      spentBy.set(r.group_id, (spentBy.get(r.group_id) ?? 0) + usd);
    }
  }

  // First treasurer per group (names resolved via the RPC below).
  const treasurerUserByGroup = new Map<string, string>();
  for (const r of treasurerRes.data ?? []) {
    if (r.group_id && !treasurerUserByGroup.has(r.group_id)) {
      treasurerUserByGroup.set(r.group_id, r.user_id);
    }
  }
  const treasurerNameByGroup = new Map<string, string>();
  await Promise.all(
    [...treasurerUserByGroup.entries()].map(async ([gid, uid]) => {
      const { data } = await supabase.rpc("get_group_member_names", {
        p_group_id: gid,
      });
      const m = (data ?? []).find((x) => x.user_id === uid);
      if (m?.full_name) treasurerNameByGroup.set(gid, m.full_name);
    }),
  );

  const groups: GroupSummary[] = groupsFlat
    .map((g) => {
      const spent = spentBy.get(g.id) ?? 0;
      return {
        id: g.id,
        name: g.name,
        projectName: g.projectName,
        spent,
        spendingLimit: g.spendingLimit,
        submissionDeadline: g.submissionDeadline,
        treasurerName: treasurerNameByGroup.get(g.id) ?? null,
        overBudget: g.spendingLimit != null && spent > g.spendingLimit,
      };
    })
    .sort(
      (a, b) =>
        a.projectName.localeCompare(b.projectName) ||
        a.name.localeCompare(b.name),
    );

  return {
    stats: {
      submittedUsd,
      awaitingReview: pendingReceipts + (notesRes.count ?? 0),
      groupsOverBudget: groups.filter((g) => g.overBudget).length,
      activeProjects: projects.filter((p) => (p.groups ?? []).length > 0).length,
    },
    groups,
  };
}
