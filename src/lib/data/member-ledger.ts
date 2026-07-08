import { createClient } from "@/lib/supabase/server";
import {
  getReceiptAttachments,
  type AttachmentLink,
} from "@/lib/data/receipt-attachments";
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
  /** receipts only (notes have no is_duplicate column) — advisory flag. */
  isDuplicate: boolean;
  /** short-lived signed URL to the receipt photo, else null (notes have none). */
  photoUrl: string | null;
  /** true when the evidence is an image (render a thumbnail); false → doc icon. */
  photoIsImage: boolean;
  /** evidence file name (doc-icon label / img alt) — UGC, else null. */
  photoName: string | null;
  /** extra attachments beyond the primary photo (migration #17); [] for notes. */
  attachments: AttachmentLink[];
}

export interface MemberLedger {
  signedIn: boolean;
  items: LedgerItem[];
}

const RECEIPT_BUCKET = "receipt-photos";
const SIGNED_URL_TTL = 60 * 10; // 10 minutes — same as /console/review (PR #43).
const IMAGE_EXT = /\.(jpe?g|png|webp|heic)$/i;

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
      .select(
        "id, group_id, vendor, receipt_date, amount, currency, status, is_late, is_duplicate, photo_path",
      )
      .in("group_id", groupIds)
      .eq("submitted_by", user.id)
      .is("deleted_at", null) // hide soft-deleted receipts
      .order("receipt_date", { ascending: false }),
    supabase
      .from("no_receipt_notes")
      .select("id, group_id, description, note_date, status, is_late")
      .in("group_id", groupIds)
      .eq("submitted_by", user.id)
      .is("deleted_at", null) // hide soft-deleted notes
      .order("note_date", { ascending: false }),
  ]);

  // Extra attachments per receipt (migration #17), batched.
  const attByReceipt = await getReceiptAttachments(
    (receiptsRes.data ?? []).map((r) => r.id),
  );

  // A member has SELECT on their own receipt rows, so RLS grants the signed URL
  // (receipt_photos_select → owner-of-linked-receipt). No new grant needed.
  const receipts: LedgerItem[] = await Promise.all(
    (receiptsRes.data ?? []).map(async (r) => {
      let photoUrl: string | null = null;
      if (r.photo_path) {
        const { data, error } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .createSignedUrl(r.photo_path, SIGNED_URL_TTL);
        // Never swallow: if signing fails the row otherwise renders with no
        // thumbnail and no trace. Surface it so the real cause is visible in
        // server logs instead of a silent, evidence-less receipt.
        if (error) {
          console.error(
            `[member-ledger] createSignedUrl failed for "${r.photo_path}": ${error.message}`,
          );
        }
        photoUrl = data?.signedUrl ?? null;
      }
      return {
        id: r.id,
        kind: "receipt",
        groupId: r.group_id,
        title: r.vendor,
        date: r.receipt_date,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        isLate: r.is_late,
        isDuplicate: r.is_duplicate,
        photoUrl,
        photoIsImage: r.photo_path ? IMAGE_EXT.test(r.photo_path) : false,
        photoName: r.photo_path ? (r.photo_path.split("/").pop() ?? null) : null,
        attachments: attByReceipt.get(r.id) ?? [],
      };
    }),
  );

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
    isDuplicate: false,
    // Notes carry no evidence file.
    photoUrl: null,
    photoIsImage: false,
    photoName: null,
    attachments: [],
  }));

  const items = [...receipts, ...notes].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return { signedIn: true, items };
}
