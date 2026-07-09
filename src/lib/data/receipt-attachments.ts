import { createClient } from "@/lib/supabase/server";

// Extra files attached to a receipt (migration #17). The PRIMARY evidence stays
// receipts.photo_path; these are the additional attachments. Visibility mirrors
// the parent receipt via RLS (receipt_attachments_select). Shared by the review
// queue, member ledger, and per-user activity views.

export interface AttachmentLink {
  /** receipt_attachments row id — needed to remove a specific attachment (#71). */
  id: string;
  /** storage path (bucket-relative). */
  path: string;
  /** short-lived signed URL to the file. */
  url: string;
  /** file name (basename of the storage path) — UGC, never translated. */
  name: string;
  /** image → could be shown/opened as a picture; else a document download. */
  isImage: boolean;
}

const RECEIPT_BUCKET = "receipt-photos";
const SIGNED_URL_TTL = 60 * 10; // 10 min — same as the primary photo URLs.
const IMAGE_EXT = /\.(jpe?g|png|webp|heic)$/i;

// Batched: one select + one createSignedUrls call for all the given receipts.
// Returns receiptId → attachments (in upload order). Empty map when none.
export async function getReceiptAttachments(
  receiptIds: string[],
): Promise<Map<string, AttachmentLink[]>> {
  const out = new Map<string, AttachmentLink[]>();
  const ids = [...new Set(receiptIds)];
  if (ids.length === 0) return out;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("receipt_attachments")
    .select("id, receipt_id, path, mime_type")
    .in("receipt_id", ids)
    .order("created_at", { ascending: true });
  if (!rows || rows.length === 0) return out;

  const paths = rows.map((r) => r.path);
  const { data: signed } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);
  const urlByPath = new Map(
    (signed ?? [])
      .filter((s) => s.signedUrl && s.path)
      .map((s) => [s.path as string, s.signedUrl]),
  );

  for (const r of rows) {
    const url = urlByPath.get(r.path);
    if (!url) continue; // signing failed for this one — skip rather than break
    const name = r.path.split("/").pop() || r.path;
    const isImage = r.mime_type
      ? r.mime_type.startsWith("image/")
      : IMAGE_EXT.test(r.path);
    const arr = out.get(r.receipt_id) ?? [];
    arr.push({ id: r.id, path: r.path, url, name, isImage });
    out.set(r.receipt_id, arr);
  }
  return out;
}
