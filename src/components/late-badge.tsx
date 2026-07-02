"use client";

import { useTranslations } from "next-intl";

// Amber "LATE" pill — shown on receipts/notes whose is_late flag is set by the DB
// trigger at insert (tamper-proof; app never sets it). Reused on the member ledger
// and both console review sections.
export function LateBadge() {
  const t = useTranslations("deadline");
  return (
    <span className="inline-flex items-center rounded-pill bg-status-pending-bg px-2 py-0.5 text-xs font-medium text-status-pending-fg">
      {t("late")}
    </span>
  );
}
