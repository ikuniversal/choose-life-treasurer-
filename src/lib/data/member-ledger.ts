import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ItemStatus = Database["public"]["Enums"]["item_status"];

export interface LedgerItem {
  id: string;
  kind: "receipt" | "note";
  groupId: string;
  /** vendor (receipt) or description (note) — UGC, NEVER translated. */
  title: string;
  /** ISO date (receipt_date | note_date). */
  date: string;
  amount: number | null;
  currency: string | null;
  status: ItemStatus;
  isLate: boolean;
}

export interface MemberLedger {
  signedIn: boolean;
  items: LedgerItem[];
}

/**
 * The signed-in member's own receipts + no-receipt notes, scoped to their
 * group(s). RLS enforces the same scope server-side; the explicit filters keep
 * the query cheap and the view "my submissions." Returns a graceful empty
 * result when there's no session — auth is still stubbed (PROJECT_STATE §4), so
 * this must not throw.
 */
export async function getMemberLedger(): Promise<MemberLedger> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { signedIn: false, items: [] };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("group_id")
    .eq("user_id", user.id)
    .not("group_id", "is", null);

  const groupIds = (roles ?? [])
    .map((r) => r.group_id)
    .filter((id): id is string => id !== null);
  if (groupIds.length === 0) return { signedIn: true, items: [] };

  const [receiptsRes, notesRes] = await Promise.all([
    supabase
      .from("receipts")
      .select("id, group_id, vendor, receipt_date, amount, currency, status, is_late")
      .in("group_id", groupIds)
      .eq("submitted_by", user.id)
      .order("receipt_date", { ascending: false }),
    supabase
      .from("no_receipt_notes")
      .select("id, group_id, description, note_date, status, is_late")
      .in("group_id", groupIds)
      .eq("submitted_by", user.id)
      .order("note_date", { ascending: false }),
  ]);

  const receipts: LedgerItem[] = (receiptsRes.data ?? []).map((r) => ({
    id: r.id,
    kind: "receipt",
    groupId: r.group_id,
    title: r.vendor,
    date: r.receipt_date,
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    isLate: r.is_late,
  }));

  const notes: LedgerItem[] = (notesRes.data ?? []).map((n) => ({
    id: n.id,
    kind: "note",
    groupId: n.group_id,
    title: n.description,
    date: n.note_date,
    amount: null,
    currency: null,
    status: n.status,
    isLate: n.is_late,
  }));

  const items = [...receipts, ...notes].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return { signedIn: true, items };
}
