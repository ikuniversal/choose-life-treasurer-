"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { removeRole } from "@/lib/admin-actions";
import type { UserRoleChip } from "@/lib/data/users";

// One user's role chips. Tapping the X arms an inline confirm (count-then-confirm,
// mirroring the guarded delete in #35); confirming calls the server action, which
// enforces the last-admin lockout and returns a friendly error shown inline.
export function UserRoleChips({ chips }: { chips: UserRoleChip[] }) {
  const t = useTranslations("users");
  const tRoles = useTranslations("roles");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (chips.length === 0) {
    return <span className="text-xs text-muted">{t("noRoles")}</span>;
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await removeRole(id);
      if (res?.error) {
        setError(res.error);
        setConfirmId(null);
        return;
      }
      setConfirmId(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1.5 rounded-pill bg-hairline-row px-2.5 py-1 text-xs text-body"
          >
            {/* role label is translated; group name is UGC — never translated */}
            <span className="font-medium text-olive">{tRoles(c.role)}</span>
            {c.groupName && <span className="text-muted">· {c.groupName}</span>}

            {confirmId === c.id ? (
              <span className="ml-0.5 inline-flex items-center gap-1">
                <span className="text-muted">{t("removeConfirm")}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(c.id)}
                  aria-label={t("confirmRemove")}
                  title={t("confirmRemove")}
                  className="rounded-full p-0.5 text-reject transition-colors hover:text-reject disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmId(null)}
                  aria-label={t("cancel")}
                  title={t("cancel")}
                  className="rounded-full p-0.5 text-muted transition-colors hover:text-ink disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setConfirmId(c.id);
                }}
                aria-label={t("remove")}
                title={t("remove")}
                className="ml-0.5 rounded-full p-0.5 text-muted transition-colors hover:text-reject"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </span>
        ))}
      </div>
      {error && <p className="text-xs text-reject">{t(error)}</p>}
    </div>
  );
}
