"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import {
  loadComments,
  postComment,
  type CommentItem,
  type ParentKind,
} from "@/lib/comment-actions";

// Expandable comment thread attached to a receipt/note. Refresh-to-see (no
// Realtime): fetches on open, refetches after posting. UGC — never translated.
export function CommentThread({
  kind,
  parentId,
  groupId,
}: {
  kind: ParentKind;
  parentId: string;
  groupId: string;
}) {
  const t = useTranslations("comments");
  const tRoles = useTranslations("roles");
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const res = await loadComments(kind, parentId, groupId);
      if (res.error) setError(res.error);
      else {
        setError(null);
        setComments(res.comments ?? []);
      }
    });
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) refresh();
  }

  function send() {
    if (!body.trim()) {
      setError("required");
      return;
    }
    startTransition(async () => {
      const res = await postComment(kind, parentId, body);
      if (res.error) {
        setError(res.error);
        return;
      }
      setBody("");
      setError(null);
      const reload = await loadComments(kind, parentId, groupId);
      setComments(reload.comments ?? []);
    });
  }

  return (
    <div className="mt-2 border-t border-hairline-row pt-2">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs font-medium text-olive"
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
        {t("toggle")}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {comments === null ? (
            <p className="text-xs text-muted">{t("loading")}</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-input bg-hairline-row/50 px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-ink">
                      {c.senderName ?? tRoles("admin")}
                    </span>
                    <span className="font-mono text-[10px] text-faint">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-body">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-xs text-reject">{t(error)}</p>}

          <div className="flex items-end gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={1}
              placeholder={t("placeholder")}
              className="min-h-9 flex-1 rounded-input border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending}
              className="h-9 shrink-0 rounded-btn bg-olive px-3 text-sm font-medium text-canvas disabled:opacity-50"
            >
              {pending ? t("posting") : t("post")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
