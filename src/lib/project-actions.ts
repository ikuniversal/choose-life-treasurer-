"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ProjectResult {
  // i18n key under "projects", or undefined on success.
  error?: string;
  ok?: boolean;
}

async function callerIsAdmin(): Promise<boolean> {
  const u = await getSessionUser();
  return !!u && u.assignments.some((a) => a.role === "admin");
}

// "" → null (both optional/nullable); invalid → bad flag for a validation error.
function parseLimit(v: FormDataEntryValue | null): {
  value: number | null;
  bad: boolean;
} {
  const s = typeof v === "string" ? v.trim() : "";
  if (s === "") return { value: null, bad: false };
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return { value: null, bad: true };
  return { value: n, bad: false };
}

function parseDate(v: FormDataEntryValue | null): {
  value: string | null;
  bad: boolean;
} {
  const s = typeof v === "string" ? v.trim() : "";
  if (s === "") return { value: null, bad: false };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { value: null, bad: true };
  return { value: s, bad: false };
}

export async function createProject(
  formData: FormData,
): Promise<ProjectResult> {
  if (!(await callerIsAdmin())) return { error: "forbidden" };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "nameRequired" };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({ name });
  if (error) return { error: "failed" };

  revalidatePath("/console/projects");
  return { ok: true };
}

export async function renameProject(
  formData: FormData,
): Promise<ProjectResult> {
  if (!(await callerIsAdmin())) return { error: "forbidden" };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "nameRequired" };

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ name }).eq("id", id);
  if (error) return { error: "failed" };

  revalidatePath("/console/projects");
  return { ok: true };
}

export async function createGroup(formData: FormData): Promise<ProjectResult> {
  if (!(await callerIsAdmin())) return { error: "forbidden" };
  const project_id = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!project_id || !name) return { error: "nameRequired" };

  const lim = parseLimit(formData.get("spendingLimit"));
  if (lim.bad) return { error: "badLimit" };
  const dl = parseDate(formData.get("deadline"));
  if (dl.bad) return { error: "badDate" };

  const supabase = await createClient();
  const { error } = await supabase.from("groups").insert({
    project_id,
    name,
    spending_limit: lim.value,
    submission_deadline: dl.value,
  });
  if (error) return { error: "failed" };

  revalidatePath("/console/projects");
  return { ok: true };
}

export async function updateGroup(formData: FormData): Promise<ProjectResult> {
  if (!(await callerIsAdmin())) return { error: "forbidden" };
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "nameRequired" };

  const lim = parseLimit(formData.get("spendingLimit"));
  if (lim.bad) return { error: "badLimit" };
  const dl = parseDate(formData.get("deadline"));
  if (dl.bad) return { error: "badDate" };

  const supabase = await createClient();
  // updated_at is maintained by the groups_set_updated_at BEFORE UPDATE trigger —
  // do not set it manually.
  const { error } = await supabase
    .from("groups")
    .update({
      name,
      spending_limit: lim.value,
      submission_deadline: dl.value,
    })
    .eq("id", id);
  if (error) return { error: "failed" };

  revalidatePath("/console/projects");
  return { ok: true };
}
