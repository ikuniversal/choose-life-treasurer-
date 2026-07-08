"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { LateBadge } from "@/components/late-badge";
import { DuplicateBadge } from "@/components/duplicate-badge";
import { CommentThread } from "@/components/comment-thread";
import { AttachmentLinks } from "@/components/attachment-links";
import { FilterPillRow, type FilterOption } from "@/components/filter-pill-row";
import type { LedgerItem } from "@/lib/data/member-ledger";
import { LedgerItemDelete } from "./ledger-item-delete";

// Canonical status order for the filter row — only statuses actually present
// among the member's items are shown (plus "All").
const STATUS_ORDER = ["pending", "approved", "rejected", "reviewed"] as const;

// Client wrapper for the member ledger: adds a status filter pill row (reskin)
// over the existing rows. Presentation only — the row markup, evidence links,
// pending-delete affordance, and comment threads are unchanged from the server
// list they replace.
export function LedgerList({ items }: { items: LedgerItem[] }) {
  const t = useTranslations("member");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState("all");

  const options: FilterOption[] = useMemo(() => {
    const present = STATUS_ORDER.filter((s) =>
      items.some((i) => i.status === s),
    );
    return [
      { value: "all", label: t("all"), count: items.length },
      ...present.map((s) => ({
        value: s,
        label: tStatus(s),
        count: items.filter((i) => i.status === s).length,
      })),
    ];
  }, [items, t, tStatus]);

  const visible =
    filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="flex flex-col gap-3">
      {options.length > 2 && (
        <FilterPillRow
          options={options}
          value={filter}
          onChange={setFilter}
          ariaLabel={t("ledgerTitle")}
        />
      )}

      <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
        {visible.map((item) => (
          <li
            key={`${item.kind}-${item.id}`}
            className="border-b border-hairline-row px-4 py-3 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* Evidence thumbnail so the member can confirm at a glance that
                    a file is attached (closes the gap flagged in #43). */}
                {item.photoUrl && item.photoIsImage ? (
                  <a
                    href={item.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("viewEvidence")}
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="h-10 w-10 rounded-input border border-hairline object-cover"
                    />
                  </a>
                ) : item.photoUrl ? (
                  <a
                    href={item.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.photoName ?? t("viewEvidence")}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input border border-hairline text-olive"
                  >
                    <FileText className="h-5 w-5" aria-hidden />
                  </a>
                ) : null}
                <div className="min-w-0">
                  {/* title is UGC (vendor / note description) — never translated */}
                  <p className="truncate text-sm font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="num text-xs text-faint">{item.date}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.amount !== null && (
                  <span className="num text-sm text-olive">
                    {item.amount.toFixed(2)} {item.currency}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {item.isDuplicate && <DuplicateBadge />}
                  {item.isLate && <LateBadge />}
                  <StatusPill status={item.status} label={tStatus(item.status)} />
                </div>
              </div>
            </div>
            {item.attachments.length > 0 && (
              <div className="mt-2">
                <AttachmentLinks
                  attachments={item.attachments}
                  label={tCommon("attachments")}
                />
              </div>
            )}
            {/* Members may remove their own submission while it is still
                pending review (always a soft delete). */}
            {item.status === "pending" && (
              <LedgerItemDelete kind={item.kind} id={item.id} />
            )}
            <CommentThread
              kind={item.kind}
              parentId={item.id}
              groupId={item.groupId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
