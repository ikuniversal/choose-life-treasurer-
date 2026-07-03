import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Category = Database["public"]["Enums"]["expense_category"];

export interface ReviewItem {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  usdEquivalent: number | null;
  category: Category;
  groupId: string;
  groupName: string | null;
  submitterName: string | null;
  receiptDate: string;
  note: string | null;
  photoUrl: string | null;
  isLate: boolean;
  isDuplicate: boolean;
}

const RECEIPT_BUCKET = "receipt-photos";
const SIGNED_URL_TTL = 60 * 10; // 10 minutes

// Pending receipts for review. RLS scopes automatically — a treasurer sees only
// their groups, an admin sees all. Uses the RLS-respecting client throughout
// (incl. the signed photo URLs); the secret admin client is never touched here.
export async function getReviewQueue(): Promise<ReviewItem[]> {
  const supabase = await createClient();

  const { data: receipts } = await supabase
    .from("receipts")
    .select(
      "id, vendor, amount, currency, usd_equivalent, category, group_id, submitted_by, receipt_date, additional_info, photo_path, is_late, is_duplicate, groups(name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = receipts ?? [];

  // Submitter display names (no FK receipts→profiles, so join in app code).
  const submitterIds = [...new Set(rows.map((r) => r.submitted_by))];
  const nameById = new Map<string, string | null>();
  if (submitterIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", submitterIds);
    for (const p of profiles ?? []) nameById.set(p.id, p.full_name);
  }

  return Promise.all(
    rows.map(async (r) => {
      let photoUrl: string | null = null;
      if (r.photo_path) {
        const { data } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .createSignedUrl(r.photo_path, SIGNED_URL_TTL);
        photoUrl = data?.signedUrl ?? null;
      }
      return {
        id: r.id,
        vendor: r.vendor,
        amount: r.amount,
        currency: r.currency,
        usdEquivalent: r.usd_equivalent,
        category: r.category,
        groupId: r.group_id,
        groupName: r.groups?.name ?? null,
        submitterName: nameById.get(r.submitted_by) ?? null,
        receiptDate: r.receipt_date,
        note: r.additional_info,
        photoUrl,
        isLate: r.is_late,
        isDuplicate: r.is_duplicate,
      };
    }),
  );
}
