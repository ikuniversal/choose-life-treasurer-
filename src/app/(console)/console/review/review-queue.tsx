"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CommentThread } from "@/components/comment-thread";
import {
  approveReceipt,
  bulkApprove,
  rejectReceipt,
} from "@/lib/review-actions";
import type { ReviewItem } from "@/lib/data/review";

export function ReviewQueue({ items }: { items: ReviewItem[] }) {
  const t = useTranslations("review");
  const tCat = useTranslations("categories");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-hairline bg-card px-4 py-2">
          <span className="text-sm text-body">
            {t("selected", { count: selected.size })}
          </span>
          <Button
            variant="approve"
            size="sm"
            disabled={pending}
            onClick={() => run(() => bulkApprove([...selected]))}
          >
            {t("approveSelected")}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4 sm:flex-row"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-1 h-4 w-4 accent-olive"
                aria-label={item.vendor}
              />
              {item.photoUrl ? (
                <a
                  href={item.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("viewPhoto")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photoUrl}
                    alt={item.vendor}
                    className="h-16 w-16 rounded-input border border-hairline object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-input border border-hairline text-xs text-faint">
                  —
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {/* vendor / submitter / note are UGC — never translated */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="truncate font-medium text-ink">
                  {item.vendor}
                </span>
                <span className="font-mono text-sm text-olive">
                  {item.amount.toFixed(2)} {item.currency}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                {item.usdEquivalent != null && (
                  <span className="font-mono">
                    ≈ {item.usdEquivalent.toFixed(2)} USD
                  </span>
                )}
                <span>· {tCat(item.category)}</span>
                {item.groupName && <span>· {item.groupName}</span>}
                <span className="font-mono">· {item.receiptDate}</span>
              </div>
              <p className="mt-1 text-xs text-faint">
                {t("submittedBy")}: {item.submitterName ?? "—"}
              </p>
              {item.note && (
                <p className="mt-1 text-sm text-body">
                  {t("note")}: {item.note}
                </p>
              )}

              {rejectingId === item.id ? (
                <div className="mt-3 flex flex-col gap-2">
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
                      onClick={() => run(() => rejectReceipt(item.id, reason))}
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
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="approve"
                    size="sm"
                    disabled={pending}
                    onClick={() => run(() => approveReceipt(item.id))}
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
                kind="receipt"
                parentId={item.id}
                groupId={item.groupId}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
