"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteUser, type DeleteUserState } from "@/lib/admin-actions";

// Per-row "Delete user" control (shown on every user row). Tap → inline confirm
// → deleteUser. On block (authored content or last-admin), the friendly message
// renders inline and no user is removed. Mirrors the #46 confirm pattern.
export function DeleteUserButton({ userId }: { userId: string }) {
  const t = useTranslations("users");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<DeleteUserState | null>(null);

  function del() {
    setState(null);
    startTransition(async () => {
      const res = await deleteUser(userId);
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
          <span className="text-xs text-muted">{t("deleteUserConfirm")}</span>
          <button
            type="button"
            disabled={pending}
            onClick={del}
            className="text-xs font-medium text-reject transition-colors hover:text-reject disabled:opacity-50"
          >
            {t("confirmDeleteUser")}
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
          {t("deleteUser")}
        </button>
      )}

      {state?.error === "hasContent" && state.counts && (
        <p className="text-right text-xs text-reject">
          {t("cannotDeleteUser", state.counts)}
        </p>
      )}
      {state?.error && state.error !== "hasContent" && (
        <p className="text-right text-xs text-reject">{t(state.error)}</p>
      )}
    </div>
  );
}
