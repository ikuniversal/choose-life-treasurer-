import { createClient } from "@/lib/supabase/server";

export interface NoteReviewItem {
  id: string;
  description: string;
  noteDate: string;
  signer1Name: string;
  signer2Name: string | null;
  signer1Url: string | null;
  signer2Url: string | null;
  groupId: string;
  groupName: string | null;
  submitterName: string | null;
}

const SIGNATURES_BUCKET = "signatures";
const SIGNED_URL_TTL = 60 * 10; // 10 minutes

// Pending no-receipt notes for review. RLS scopes automatically (treasurer →
// their groups, admin → all). Signature images are surfaced via short-lived
// signed URLs from the RLS-respecting client — never the secret client.
export async function getNoteReviewQueue(): Promise<NoteReviewItem[]> {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("no_receipt_notes")
    .select(
      "id, description, note_date, signer1_name, signer2_name, signer1_signature_path, signer2_signature_path, group_id, submitted_by, groups(name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = notes ?? [];

  const submitterIds = [...new Set(rows.map((r) => r.submitted_by))];
  const nameById = new Map<string, string | null>();
  if (submitterIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", submitterIds);
    for (const p of profiles ?? []) nameById.set(p.id, p.full_name);
  }

  async function signedUrl(path: string | null): Promise<string | null> {
    if (!path) return null;
    const { data } = await supabase.storage
      .from(SIGNATURES_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);
    return data?.signedUrl ?? null;
  }

  return Promise.all(
    rows.map(async (r) => {
      const [signer1Url, signer2Url] = await Promise.all([
        signedUrl(r.signer1_signature_path),
        signedUrl(r.signer2_signature_path),
      ]);
      return {
        id: r.id,
        description: r.description,
        noteDate: r.note_date,
        signer1Name: r.signer1_name,
        signer2Name: r.signer2_name,
        signer1Url,
        signer2Url,
        groupId: r.group_id,
        groupName: r.groups?.name ?? null,
        submitterName: nameById.get(r.submitted_by) ?? null,
      };
    }),
  );
}
