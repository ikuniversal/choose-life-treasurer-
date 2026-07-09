import { createClient } from "@/lib/supabase/server";
import { getReceiptAttachments } from "@/lib/data/receipt-attachments";
import type { ActivityNote, ActivityReceipt } from "@/lib/data/user-activity";

// One GROUP's receipts + notes for the /console/groups/[id] browsable expense
// view. Mirrors #60's getUserActivity read shape but keyed on group_id. Runs on
// the RLS-respecting client: admins see every group, treasurers their groups
// (groups_select via is_member_of), project_admins their project's groups
// (groups_project_admin_write USING) — and all three read the receipts/notes via
// the existing #22 SELECT policies. Soft-deleted rows excluded. Returns null when
// the group isn't visible to the viewer (or doesn't exist) → the page 404s.

export interface GroupActivity {
  groupId: string;
  /** group name — UGC, never translated. */
  groupName: string;
  /** project name — UGC, never translated. */
  projectName: string | null;
  receipts: ActivityReceipt[];
  notes: ActivityNote[];
}

export async function getGroupActivity(
  groupId: string,
): Promise<GroupActivity | null> {
  const id = groupId.trim();
  if (!id) return null;

  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, projects(name)")
    .eq("id", id)
    .maybeSingle();
  if (!group) return null; // not visible to this viewer, or unknown id

  const [receiptsRes, notesRes] = await Promise.all([
    supabase
      .from("receipts")
      .select(
        "id, vendor, amount, currency, usd_equivalent, category, additional_info, photo_path, status, receipt_date, is_late, is_duplicate",
      )
      .eq("group_id", id)
      .is("deleted_at", null)
      .order("receipt_date", { ascending: false }),
    supabase
      .from("no_receipt_notes")
      .select("id, description, status, note_date, is_late")
      .eq("group_id", id)
      .is("deleted_at", null)
      .order("note_date", { ascending: false }),
  ]);

  const attByReceipt = await getReceiptAttachments(
    (receiptsRes.data ?? []).map((r) => r.id),
  );

  const receipts: ActivityReceipt[] = (receiptsRes.data ?? []).map((r) => ({
    id: r.id,
    vendor: r.vendor,
    amount: r.amount,
    currency: r.currency,
    usdEquivalent: r.usd_equivalent,
    category: r.category,
    additionalInfo: r.additional_info,
    photoPath: r.photo_path,
    status: r.status,
    date: r.receipt_date,
    isLate: r.is_late,
    isDuplicate: r.is_duplicate,
    groupName: group.name,
    attachments: attByReceipt.get(r.id) ?? [],
  }));

  const notes: ActivityNote[] = (notesRes.data ?? []).map((n) => ({
    id: n.id,
    description: n.description,
    status: n.status,
    date: n.note_date,
    isLate: n.is_late,
    groupName: group.name,
  }));

  return {
    groupId: id,
    groupName: group.name,
    projectName: group.projects?.name ?? null,
    receipts,
    notes,
  };
}
