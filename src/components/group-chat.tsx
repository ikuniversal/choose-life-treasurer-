"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";
import {
  loadGroupMessages,
  postGroupMessage,
  type ChatMessage,
} from "@/lib/chat-actions";

// Group chat surface (refresh-to-see v1, no Realtime). Reused by member + console.
export function GroupChat({ groupId }: { groupId: string }) {
  const t = useTranslations("chat");
  const tRoles = useTranslations("roles");
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadLatest = useCallback(() => {
    startTransition(async () => {
      const res = await loadGroupMessages(groupId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setMessages(res.messages ?? []);
      setHasMore(!!res.hasMore);
    });
  }, [groupId]);

  // Load on mount / group change. The parent keys this component by groupId, so
  // a group switch remounts and resets state — no setState in the effect body.
  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  function loadOlder() {
    const oldest = messages?.[0]?.createdAt;
    if (!oldest) return;
    startTransition(async () => {
      const res = await loadGroupMessages(groupId, oldest);
      if (res.error) {
        setError(res.error);
        return;
      }
      setMessages((prev) => [...(res.messages ?? []), ...(prev ?? [])]);
      setHasMore(!!res.hasMore);
    });
  }

  function send() {
    if (!body.trim()) {
      setError("required");
      return;
    }
    startTransition(async () => {
      const res = await postGroupMessage(groupId, body);
      if (res.error) {
        setError(res.error);
        return;
      }
      setBody("");
      setError(null);
      const reload = await loadGroupMessages(groupId);
      setMessages(reload.messages ?? []);
      setHasMore(!!reload.hasMore);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={loadLatest}
          disabled={pending}
          className="flex items-center gap-1.5 text-xs font-medium text-olive"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
          {t("refresh")}
        </button>
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadOlder}
          disabled={pending}
          className="self-center text-xs text-muted hover:text-body"
        >
          {t("loadOlder")}
        </button>
      )}

      {messages === null ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li key={m.id} className="rounded-input bg-hairline-row/50 px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                {/* sender + body are UGC — never translated */}
                <span className="text-xs font-medium text-ink">
                  {m.senderName ?? tRoles("admin")}
                </span>
                <span className="font-mono text-[10px] text-faint">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-body">
                {m.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          placeholder={t("placeholder")}
          className="min-h-10 flex-1 rounded-input border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending}
          className="h-10 shrink-0 rounded-btn bg-olive px-4 text-sm font-medium text-canvas disabled:opacity-50"
        >
          {pending ? t("sending") : t("send")}
        </button>
      </div>
    </div>
  );
}
