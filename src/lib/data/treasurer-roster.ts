import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Treasurer view of /console/users: the member roster of the treasurer's own
// group(s). Names resolve ONLY via the get_group_member_names RPC (treasurer-
// callable) — never a widened profiles SELECT (§8). No admin client, no emails:
// treasurers see names, not auth accounts.

export interface RosterMember {
  userId: string;
  fullName: string | null;
}

export interface RosterGroup {
  groupId: string;
  groupName: string | null;
  members: RosterMember[];
}

export async function getTreasurerRoster(): Promise<RosterGroup[]> {
  const me = await getSessionUser();
  if (!me) return [];

  // The treasurer's own groups (dedup; drop any global/group-less rows).
  const groupNameById = new Map<string, string | null>();
  for (const a of me.assignments) {
    if (a.role === "treasurer" && a.groupId) {
      groupNameById.set(a.groupId, a.groupName);
    }
  }
  const groupIds = [...groupNameById.keys()];
  if (groupIds.length === 0) return [];

  const supabase = await createClient();

  // Member-role rows in those groups (RLS lets a treasurer see their groups'
  // roles). We list only role='member' — treasurers/admins are not removable.
  const { data: memberRoles } = await supabase
    .from("user_roles")
    .select("user_id, group_id")
    .eq("role", "member")
    .in("group_id", groupIds);

  // Names per group via the RPC (keyed user_id → full_name).
  const namesByGroup = new Map<string, Map<string, string | null>>();
  await Promise.all(
    groupIds.map(async (gid) => {
      const { data } = await supabase.rpc("get_group_member_names", {
        p_group_id: gid,
      });
      namesByGroup.set(
        gid,
        new Map(
          (data ?? []).map(
            (x) => [x.user_id, x.full_name] as [string, string | null],
          ),
        ),
      );
    }),
  );

  const membersByGroup = new Map<string, RosterMember[]>();
  for (const r of memberRoles ?? []) {
    if (!r.group_id) continue;
    const arr = membersByGroup.get(r.group_id) ?? [];
    arr.push({
      userId: r.user_id,
      fullName: namesByGroup.get(r.group_id)?.get(r.user_id) ?? null,
    });
    membersByGroup.set(r.group_id, arr);
  }

  return groupIds
    .map((gid) => ({
      groupId: gid,
      groupName: groupNameById.get(gid) ?? null,
      members: (membersByGroup.get(gid) ?? []).sort((a, b) =>
        (a.fullName ?? "").localeCompare(b.fullName ?? ""),
      ),
    }))
    .sort((a, b) => (a.groupName ?? "").localeCompare(b.groupName ?? ""));
}
