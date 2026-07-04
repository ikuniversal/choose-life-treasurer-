"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { softDeleteOwnReceipt } from "@/lib/receipt-actions";
import { softDeleteOwnNote } from "@/lib/note-actions";

// Member-side delete for a ledger row. Only rendered on the member's OWN pending
// items; it is ALWAYS a soft delete (the owner-pending RLS policy scopes it).
// Tap → inline confirm → delete (mirrors the count-then-confirm elsewhere).
export function LedgerItemDelete({
  kind,
  id,
}: {
  kind: "receipt" | "note";
  id: string;
}) {
  const t = useTranslations("member");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function del() {
    setError(null);
    startTransition(async () => {
      const res =
        kind === "receipt"
          ? await softDeleteOwnReceipt(id)
          : await softDeleteOwnNote(id);
      if (res?.error) {
        setError(res.error);
        setConfirming(false);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-1 flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{t("deleteConfirm")}</span>
          <button
            type="button"
            disabled={pending}
            onClick={del}
            className="text-xs font-medium text-reject transition-colors hover:text-reject disabled:opacity-50"
          >
            {t("confirmDelete")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="text-xs text-muted transition-colors hover:text-ink disabled:opacity-50"
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="text-xs text-muted transition-colors hover:text-reject"
        >
          {t("delete")}
        </button>
      )}
      {error && <span className="text-xs text-reject">{t(error)}</span>}
    </div>
  );
}
