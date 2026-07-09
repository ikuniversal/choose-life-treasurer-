"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { StatusPill } from "@/components/status-pill";
import { LateBadge } from "@/components/late-badge";
import { DuplicateBadge } from "@/components/duplicate-badge";
import { AttachmentLinks } from "@/components/attachment-links";
import { FilterPillRow, type FilterOption } from "@/components/filter-pill-row";
import type { AttachmentLink } from "@/lib/data/receipt-attachments";
import type { ActivityNote, ActivityReceipt } from "@/lib/data/user-activity";
import type { Database } from "@/lib/supabase/database.types";

type ItemStatus = Database["public"]["Enums"]["item_status"];

// Canonical status order for the filter row — only statuses present are shown.
const STATUS_ORDER: ItemStatus[] = [
  "pending",
  "reviewed",
  "approved",
  "rejected",
];

interface Row {
  key: string;
  /** vendor (receipt) or description (note) — UGC, never translated. */
  title: string;
  date: string;
  amount: number | null;
  currency: string | null;
  status: ItemStatus;
  isLate: boolean;
  isDuplicate: boolean;
  attachments: AttachmentLink[];
}

// Browsable, status-filterable list of a group's receipts + notes (read-only).
// One unified date-sorted stream with a status FilterPillRow; StatusPill +
// LATE/DUP badges + .num values + attachment links — the #60 activity rendering,
// group-scoped and filterable. No actions here (review/approve live in #12).
export function GroupActivityList({
  receipts,
  notes,
}: {
  receipts: ActivityReceipt[];
  notes: ActivityNote[];
}) {
  const t = useTranslations("groupExpenses");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState("all");

  const rows: Row[] = useMemo(() => {
    const r: Row[] = receipts.map((x) => ({
      key: `receipt-${x.id}`,
      title: x.vendor,
      date: x.date,
      amount: x.amount,
      currency: x.currency,
      status: x.status,
      isLate: x.isLate,
      isDuplicate: x.isDuplicate,
      attachments: x.attachments,
    }));
    const n: Row[] = notes.map((x) => ({
      key: `note-${x.id}`,
      title: x.description,
      date: x.date,
      amount: null,
      currency: null,
      status: x.status,
      isLate: x.isLate,
      isDuplicate: false,
      attachments: [],
    }));
    return [...r, ...n].sort((a, b) => b.date.localeCompare(a.date));
  }, [receipts, notes]);

  const options: FilterOption[] = useMemo(() => {
    const present = STATUS_ORDER.filter((s) => rows.some((x) => x.status === s));
    return [
      { value: "all", label: t("all"), count: rows.length },
      ...present.map((s) => ({
        value: s,
        label: tStatus(s),
        count: rows.filter((x) => x.status === s).length,
      })),
    ];
  }, [rows, t, tStatus]);

  const visible =
    filter === "all" ? rows : rows.filter((x) => x.status === filter);

  if (rows.length === 0) {
    return (
      <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {options.length > 2 && (
        <FilterPillRow
          options={options}
          value={filter}
          onChange={setFilter}
          ariaLabel={t("filterLabel")}
        />
      )}

      <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
        {visible.map((row) => (
          <li
            key={row.key}
            className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {/* title is UGC — never translated */}
                <p className="truncate text-sm font-medium text-ink">
                  {row.title}
                </p>
                <p className="num text-xs text-faint">{row.date}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {row.amount !== null && (
                  <span className="num text-sm text-olive">
                    {row.amount.toFixed(2)} {row.currency}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {row.isDuplicate && <DuplicateBadge />}
                  {row.isLate && <LateBadge />}
                  <StatusPill status={row.status} label={tStatus(row.status)} />
                </div>
              </div>
            </div>
            {row.attachments.length > 0 && (
              <AttachmentLinks
                attachments={row.attachments}
                label={tCommon("attachments")}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
