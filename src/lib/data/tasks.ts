import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type TaskStatus = Database["public"]["Enums"]["task_status"];

export interface MyTask {
  id: string;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
  /** creator full name via RPC; null when not in the group roster (e.g. org-wide admin). */
  creatorName: string | null;
}

export interface ConsoleTask {
  id: string;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
  assigneeName: string | null;
}

export interface RosterMember {
  userId: string;
  fullName: string;
}

export interface GroupOption {
  id: string;
  name: string;
}

// The signed-in user's assigned tasks. Plain select (RLS scopes to assignee).
// Creator names resolve through the sanctioned RPC (one call per distinct group).
export async function getMyTasks(): Promise<MyTask[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, status, created_by, group_id")
    .eq("assignee", user.id)
    .order("created_at", { ascending: false });
  const rows = tasks ?? [];

  const groupIds = [...new Set(rows.map((r) => r.group_id))];
  const nameByUser = new Map<string, string>();
  await Promise.all(
    groupIds.map(async (gid) => {
      const { data } = await supabase.rpc("get_group_member_names", {
        p_group_id: gid,
      });
      for (const m of data ?? []) nameByUser.set(m.user_id, m.full_name);
    }),
  );

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    dueDate: r.due_date,
    status: r.status,
    creatorName: nameByUser.get(r.created_by) ?? null,
  }));
}

// Groups the console user can act in (RLS: admin → all, treasurer → own).
export async function getConsoleGroups(): Promise<GroupOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("id, name")
    .order("name");
  return data ?? [];
}

// A group's tasks (with assignee names) + its roster (for the picker) — one RPC.
export async function getGroupTasksAndRoster(
  groupId: string,
): Promise<{ tasks: ConsoleTask[]; roster: RosterMember[] }> {
  const supabase = await createClient();

  const [tasksRes, rosterRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date, status, assignee")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_group_member_names", { p_group_id: groupId }),
  ]);

  const roster: RosterMember[] = (rosterRes.data ?? []).map((m) => ({
    userId: m.user_id,
    fullName: m.full_name,
  }));
  const nameBy = new Map(roster.map((m) => [m.userId, m.fullName]));

  const tasks: ConsoleTask[] = (tasksRes.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    dueDate: r.due_date,
    status: r.status,
    assigneeName: nameBy.get(r.assignee) ?? null,
  }));

  return { tasks, roster };
}
