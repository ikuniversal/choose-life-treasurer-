import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getReceiptAttachments,
  type AttachmentLink,
} from "@/lib/data/receipt-attachments";
import type { Database } from "@/lib/supabase/database.types";

type ItemStatus = Database["public"]["Enums"]["item_status"];
type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

export interface ActivityReceipt {
  id: string;
  /** vendor — UGC, never translated. */
  vendor: string;
  amount: number;
  currency: string;
  usdEquivalent: number | null;
  /** expense_category enum (7 values); labels via the shared `categories` i18n. */
  category: ExpenseCategory;
  /** free-text note on the receipt — UGC, never translated. */
  additionalInfo: string | null;
  /** primary evidence storage path (bucket-relative); null if none. */
  photoPath: string | null;
  status: ItemStatus;
  date: string;
  isLate: boolean;
  isDuplicate: boolean;
  groupName: string | null;
  /** extra attachments beyond the primary photo (migration #17). */
  attachments: AttachmentLink[];
}

export interface ActivityNote {
  id: string;
  /** description — UGC, never translated. */
  description: string;
  status: ItemStatus;
  date: string;
  isLate: boolean;
  groupName: string | null;
}

export interface UserActivity {
  userId: string;
  fullName: string | null;
  email: string | null;
  receipts: ActivityReceipt[];
  notes: ActivityNote[];
}

// One user's receipts + notes for the admin per-user activity view (#57 route,
// admin-only). All reads run on the RLS-respecting client — an admin sees every
// receipt/note. The email comes from an auth.admin.* lookup (the only sanctioned
// admin-client use — same precedent as getUsersOverview, §8). Soft-deleted rows
// are excluded (deleted_at is null). Returns null when the user has no profile
// and no auth account (unknown id).
export async function getUserActivity(
  userId: string,
): Promise<UserActivity | null> {
  const id = userId.trim();
  if (!id) return null;

  const supabase = await createClient();

  const [profileRes, receiptsRes, notesRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", id).maybeSingle(),
    supabase
      .from("receipts")
      .select(
        "id, vendor, amount, currency, usd_equivalent, category, additional_info, photo_path, status, receipt_date, is_late, is_duplicate, groups(name)",
      )
      .eq("submitted_by", id)
      .is("deleted_at", null)
      .order("receipt_date", { ascending: false }),
    supabase
      .from("no_receipt_notes")
      .select("id, description, status, note_date, is_late, groups(name)")
      .eq("submitted_by", id)
      .is("deleted_at", null)
      .order("note_date", { ascending: false }),
  ]);

  // Email via the auth admin listing (auth.admin.* ONLY — sanctioned, §8).
  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);

  const fullName = profileRes.data?.full_name ?? null;
  const email = authUser?.user?.email ?? null;

  // Unknown id: no profile AND no auth account.
  if (!fullName && !email && !authUser?.user) return null;

  // Extra attachments per receipt (migration #17), batched.
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
    groupName: r.groups?.name ?? null,
    attachments: attByReceipt.get(r.id) ?? [],
  }));

  const notes: ActivityNote[] = (notesRes.data ?? []).map((n) => ({
    id: n.id,
    description: n.description,
    status: n.status,
    date: n.note_date,
    isLate: n.is_late,
    groupName: n.groups?.name ?? null,
  }));

  return { userId: id, fullName, email, receipts, notes };
}
