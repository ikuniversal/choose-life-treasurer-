"use server";

import { revalidatePath } from "next/cache";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface TaskResult {
  // i18n key under "tasks", or undefined on success.
  error?: string;
  ok?: boolean;
}

async function callerIsReviewer(): Promise<boolean> {
  return canAccessConsole(await getSessionUser());
}

// Member action: an assignee marks their own assigned task done. RLS enforces
// that only the assignee (or treasurer/admin) can update; the .eq guard keeps
// this to the assigned→done transition only. updated_at is trigger-owned.
export async function markTaskDone(id: string): Promise<TaskResult> {
  if (!id) return { error: "failed" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "done" })
    .eq("id", id)
    .eq("status", "assigned");
  if (error) return { error: "failed" };

  revalidatePath("/tasks");
  return { ok: true };
}

// Console action: treasurer/admin creates a task in a group they manage.
export async function createTask(formData: FormData): Promise<TaskResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "forbidden" };

  const group_id = String(formData.get("groupId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const assignee = String(formData.get("assignee") ?? "").trim();
  const rawDue = String(formData.get("dueDate") ?? "").trim();
  const due_date = rawDue === "" ? null : rawDue;

  if (!group_id || !title || !assignee) return { error: "required" };
  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return { error: "badDate" };
  }

  // status defaults to 'assigned'; updated_at owned by tasks_set_updated_at.
  const { error } = await supabase.from("tasks").insert({
    group_id,
    title,
    assignee,
    due_date,
    created_by: user.id,
  });
  if (error) return { error: "failed" };

  revalidatePath("/console/tasks");
  return { ok: true };
}

// Console action: treasurer/admin approves a completed task (done → approved).
export async function approveTask(id: string): Promise<TaskResult> {
  if (!(await callerIsReviewer())) return { error: "forbidden" };
  if (!id) return { error: "failed" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "done");
  if (error) return { error: "failed" };

  revalidatePath("/console/tasks");
  return { ok: true };
}
