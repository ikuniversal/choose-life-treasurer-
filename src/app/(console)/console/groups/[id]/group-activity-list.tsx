"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { LateBadge } from "@/components/late-badge";
import { DuplicateBadge } from "@/components/duplicate-badge";
import { AttachmentLinks } from "@/components/attachment-links";
import { FilterPillRow, type FilterOption } from "@/components/filter-pill-row";
import type { AttachmentLink } from "@/lib/data/receipt-attachments";
import type { ActivityNote, ActivityReceipt } from "@/lib/data/user-activity";
import type { Database } from "@/lib/supabase/database.types";
import { ReceiptEditForm } from "./receipt-edit-form";

type ItemStatus = Database["public"]["Enums"]["item_status"];
type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

// Canonical status order for the filter row — only statuses present are shown.
const STATUS_ORDER: ItemStatus[] = [
  "pending",
  "reviewed",
  "approved",
  "rejected",
];

// Canonical expense_category order (mirrors the enum) — only categories present
// in the visible rows are shown.
const CATEGORY_ORDER: ExpenseCategory[] = [
  "groceries",
  "fuel",
  "meals",
  "medical",
  "transport",
  "lodging",
  "other",
];

interface Row {
  key: string;
  /** receipt id when this row is a receipt; null for a no-receipt note. */
  receiptId: string | null;
  /** vendor (receipt) or description (note) — UGC, never translated. */
  title: string;
  date: string;
  amount: number | null;
  currency: string | null;
  /** stored-at-submission USD value — NEVER recomputed from live FX (§8). */
  usdEquivalent: number | null;
  /** receipt category, or null for a no-receipt note (excluded from breakdown). */
  category: ExpenseCategory | null;
  status: ItemStatus;
  isLate: boolean;
  isDuplicate: boolean;
  attachments: AttachmentLink[];
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

// Browsable, status-filterable list of a group's receipts + notes (read-only),
// with a scope-aware totals summary. One unified date-sorted stream with a status
// FilterPillRow; StatusPill + LATE/DUP badges + .num values + attachment links —
// the #60 activity rendering, group-scoped and filterable. No actions here
// (review/approve live in #12).
export function GroupActivityList({
  receipts,
  notes,
  isAdmin = false,
  groupId,
  currencies = [],
}: {
  receipts: ActivityReceipt[];
  notes: ActivityNote[];
  /** admin-only Edit affordance on receipt rows (#71). */
  isAdmin?: boolean;
  groupId: string;
  currencies?: string[];
}) {
  const t = useTranslations("groupExpenses");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("categories");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Receipt-by-id for the edit form (admin only).
  const receiptById = useMemo(() => {
    const m = new Map<string, ActivityReceipt>();
    for (const x of receipts) m.set(x.id, x);
    return m;
  }, [receipts]);

  const rows: Row[] = useMemo(() => {
    const r: Row[] = receipts.map((x) => ({
      key: `receipt-${x.id}`,
      receiptId: x.id,
      title: x.vendor,
      date: x.date,
      amount: x.amount,
      currency: x.currency,
      usdEquivalent: x.usdEquivalent,
      category: x.category,
      status: x.status,
      isLate: x.isLate,
      isDuplicate: x.isDuplicate,
      attachments: x.attachments,
    }));
    const n: Row[] = notes.map((x) => ({
      key: `note-${x.id}`,
      receiptId: null,
      title: x.description,
      date: x.date,
      amount: null,
      currency: null,
      usdEquivalent: null,
      category: null,
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

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((x) => x.status === filter)),
    [rows, filter],
  );

  // Scope-aware totals — reflect ONLY the currently visible (filtered) rows.
  const totals = useMemo(() => {
    // Per-currency: raw amounts grouped by currency (receipts; notes carry none).
    const byCurrency = new Map<string, number>();
    // USD grand total: sum of the stored usd_equivalent (never recomputed).
    let usdTotal = 0;
    // Rows that carry a money amount but no stored USD value → excluded, flagged.
    let usdMissing = 0;
    // Per-category USD-equivalent subtotals (receipts only → category != null).
    const byCategory = new Map<ExpenseCategory, number>();
    let categoryUsdMissing = 0;
    let hasNotes = false;

    for (const row of visible) {
      if (row.amount !== null && row.currency) {
        byCurrency.set(
          row.currency,
          (byCurrency.get(row.currency) ?? 0) + row.amount,
        );
      }
      if (row.usdEquivalent !== null) {
        usdTotal += row.usdEquivalent;
      } else if (row.amount !== null) {
        usdMissing += 1;
      }

      if (row.category === null) {
        hasNotes = true; // no-receipt note — excluded from the category breakdown
        continue;
      }
      if (row.usdEquivalent !== null) {
        byCategory.set(
          row.category,
          (byCategory.get(row.category) ?? 0) + row.usdEquivalent,
        );
      } else {
        categoryUsdMissing += 1;
      }
    }

    const currencyLines = [...byCurrency.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    const categoryLines = CATEGORY_ORDER.filter((c) => byCategory.has(c)).map(
      (c) => [c, byCategory.get(c) as number] as const,
    );

    return {
      currencyLines,
      usdTotal,
      usdMissing,
      categoryLines,
      categoryUsdMissing,
      hasNotes,
    };
  }, [visible]);

  if (rows.length === 0) {
    return (
      <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
        {t("empty")}
      </p>
    );
  }

  const scope = filter === "all" ? t("all") : tStatus(filter);

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

      {/* Scope-aware totals: currency lines → USD grand total → per-category. */}
      {visible.length > 0 && (
        <section
          aria-label={t("totalsScoped", { scope })}
          className="flex flex-col gap-3 rounded-card-lg bg-card p-4 shadow-card"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("totalsScoped", { scope })}
          </h2>

          {totals.currencyLines.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {totals.currencyLines.map(([currency, sum]) => (
                <li
                  key={currency}
                  className="flex items-baseline justify-between gap-3"
                >
                  {/* currency code is data, not translated */}
                  <span className="text-sm text-body">{currency}</span>
                  <span className="num text-sm font-medium text-ink">
                    {sum.toFixed(2)} {currency}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("noAmounts")}</p>
          )}

          <div className="flex items-baseline justify-between gap-3 border-t border-hairline-row pt-3">
            <span className="text-sm font-medium text-body">
              {t("usdTotal")}
            </span>
            <span className="num text-base font-bold text-ink">
              {usd(totals.usdTotal)}
            </span>
          </div>
          {totals.usdMissing > 0 && (
            <p className="text-xs text-faint">
              {t("usdMissing", { count: totals.usdMissing })}
            </p>
          )}

          {totals.categoryLines.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-hairline-row pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t("byCategory")}
              </p>
              <ul className="flex flex-col gap-1">
                {totals.categoryLines.map(([category, sum]) => (
                  <li
                    key={category}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-body">
                      {tCategories(category)}
                    </span>
                    <span className="num text-sm font-medium text-ink">
                      {usd(sum)}
                    </span>
                  </li>
                ))}
              </ul>
              {totals.categoryUsdMissing > 0 && (
                <p className="text-xs text-faint">
                  {t("usdMissing", { count: totals.categoryUsdMissing })}
                </p>
              )}
              {totals.hasNotes && (
                <p className="text-xs text-faint">{t("notesExcluded")}</p>
              )}
            </div>
          )}
        </section>
      )}

      <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
        {visible.map((row) => {
          const editable = isAdmin && row.receiptId !== null;
          const editing = editable && editingId === row.receiptId;
          const editingReceipt =
            editing && row.receiptId ? receiptById.get(row.receiptId) : undefined;
          return (
            <li
              key={row.key}
              className="border-b border-hairline-row last:border-b-0"
            >
              <div className="flex flex-col gap-2 px-4 py-3">
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
                      <StatusPill
                        status={row.status}
                        label={tStatus(row.status)}
                      />
                      {editable && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(editing ? null : row.receiptId)
                          }
                          aria-expanded={editing}
                          className="inline-flex items-center gap-1 rounded-pill border border-hairline px-2 py-0.5 text-xs text-body transition-colors hover:bg-hairline-row"
                        >
                          <Pencil className="h-3 w-3" aria-hidden />
                          {t("edit")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {row.attachments.length > 0 && (
                  <AttachmentLinks
                    attachments={row.attachments}
                    label={tCommon("attachments")}
                  />
                )}
              </div>
              {editingReceipt && (
                <ReceiptEditForm
                  receipt={editingReceipt}
                  groupId={groupId}
                  currencies={currencies}
                  onClose={() => setEditingId(null)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
