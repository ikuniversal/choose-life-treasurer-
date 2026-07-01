"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/signature-pad";
import { createClient } from "@/lib/supabase/client";
import { saveNoReceiptNote } from "@/lib/note-actions";

const SIGNATURES_BUCKET = "signatures";

const inputCls =
  "w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

export function NoteForm({
  groups,
}: {
  groups: { id: string; name: string }[];
}) {
  const t = useTranslations("notes");
  const router = useRouter();

  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [noteDate, setNoteDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [signer1Name, setSigner1Name] = useState("");
  const [signer2Name, setSigner2Name] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pad1 = useRef<SignaturePadHandle>(null);
  const pad2 = useRef<SignaturePadHandle>(null);

  async function uploadSignature(
    supabase: ReturnType<typeof createClient>,
    pad: SignaturePadHandle | null,
  ): Promise<string | null> {
    if (!pad) return null;
    const blob = await pad.toBlob();
    if (!blob) return null;
    // PATH: first segment MUST be group_id (RLS splits on '/').
    const path = `${groupId}/${crypto.randomUUID()}.png`;
    const { error: upErr } = await supabase.storage
      .from(SIGNATURES_BUCKET)
      .upload(path, blob, { contentType: "image/png", upsert: false });
    if (upErr) return null;
    return path;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Both names + both signatures required (client-validate).
    if (
      !groupId ||
      !description.trim() ||
      !signer1Name.trim() ||
      !signer2Name.trim() ||
      pad1.current?.isEmpty() !== false ||
      pad2.current?.isEmpty() !== false
    ) {
      setError("required");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    const [path1, path2] = await Promise.all([
      uploadSignature(supabase, pad1.current),
      uploadSignature(supabase, pad2.current),
    ]);
    if (!path1 || !path2) {
      setError("uploadFailed");
      setBusy(false);
      return;
    }

    const res = await saveNoReceiptNote({
      groupId,
      description,
      noteDate,
      signer1Name,
      signer2Name,
      signer1Path: path1,
      signer2Path: path2,
    });
    if (res.error) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {groups.length > 1 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("group")}</span>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className={`${inputCls} h-10`}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("description")}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
          className={`${inputCls} py-2`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-body">{t("date")}</span>
        <input
          type="date"
          value={noteDate}
          onChange={(e) => setNoteDate(e.target.value)}
          required
          className={`${inputCls} h-10`}
        />
      </label>

      <div className="flex flex-col gap-4 border-t border-hairline pt-4">
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("signer1")}</span>
            <input
              value={signer1Name}
              onChange={(e) => setSigner1Name(e.target.value)}
              required
              className={`${inputCls} h-10`}
            />
          </label>
          <SignaturePad
            ref={pad1}
            label={t("signature1")}
            clearLabel={t("clear")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("signer2")}</span>
            <input
              value={signer2Name}
              onChange={(e) => setSigner2Name(e.target.value)}
              required
              className={`${inputCls} h-10`}
            />
          </label>
          <SignaturePad
            ref={pad2}
            label={t("signature2")}
            clearLabel={t("clear")}
          />
        </div>
      </div>

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
