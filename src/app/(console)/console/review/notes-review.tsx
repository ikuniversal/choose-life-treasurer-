"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CommentThread } from "@/components/comment-thread";
import { LateBadge } from "@/components/late-badge";
import { approveNote, rejectNote } from "@/lib/note-actions";
import type { NoteReviewItem } from "@/lib/data/note-review";

export function NotesReview({ items }: { items: NoteReviewItem[] }) {
  const t = useTranslations("notes");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res?.error) {
        setError(res.error);
        return;
      }
      setRejectingId(null);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4"
          >
            {/* description / signer names are UGC — never translated */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-ink">{item.description}</p>
              {item.isLate && <LateBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="font-mono">{item.noteDate}</span>
              {item.groupName && <span>· {item.groupName}</span>}
              <span>
                · {t("submittedBy")}: {item.submitterName ?? "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: item.signer1Name, url: item.signer1Url },
                { name: item.signer2Name, url: item.signer2Url },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="truncate text-xs font-medium text-body">
                    {s.name ?? "—"}
                  </span>
                  {s.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.url}
                      alt={s.name ?? ""}
                      className="h-20 w-full rounded-input border border-hairline bg-white object-contain"
                    />
                  ) : (
                    <div className="flex h-20 items-center justify-center rounded-input border border-hairline text-xs text-faint">
                      —
                    </div>
                  )}
                </div>
              ))}
            </div>

            {rejectingId === item.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder={t("rejectPlaceholder")}
                  className="w-full rounded-input border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="reject"
                    size="sm"
                    disabled={pending || !reason.trim()}
                    onClick={() => run(() => rejectNote(item.id, reason))}
                  >
                    {t("confirmReject")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setRejectingId(null);
                      setReason("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="approve"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => approveNote(item.id))}
                >
                  {t("approve")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    setRejectingId(item.id);
                    setReason("");
                  }}
                >
                  {t("reject")}
                </Button>
              </div>
            )}
            <CommentThread
              kind="note"
              parentId={item.id}
              groupId={item.groupId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
