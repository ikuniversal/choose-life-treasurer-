"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { removeMember, type RemoveMemberState } from "@/lib/admin-actions";

// Treasurer-only per-member control on the roster. Tap → inline confirm →
// removeMember. On a blocked/empty result the friendly message renders inline
// and no one is removed. Mirrors the #46 confirm pattern.
export function RemoveMemberButton({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const t = useTranslations("users");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<RemoveMemberState | null>(null);

  function remove() {
    setState(null);
    startTransition(async () => {
      const res = await removeMember(userId, groupId);
      setConfirming(false);
      if (res.ok) {
        router.refresh();
        return;
      }
      setState(res);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{t("removeMemberConfirm")}</span>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="text-xs font-medium text-reject transition-colors hover:text-reject disabled:opacity-50"
          >
            {t("confirmRemoveMember")}
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
            setState(null);
            setConfirming(true);
          }}
          className="text-xs text-muted transition-colors hover:text-reject"
        >
          {t("removeMember")}
        </button>
      )}

      {state?.error && (
        <p className="text-right text-xs text-reject">{t(state.error)}</p>
      )}
    </div>
  );
}
