"use client";

import { useTranslations } from "next-intl";

// "Possible duplicate" pill — distinct blue (reviewed palette) from the amber LATE
// badge. Advisory only: set on receipts by the DB trigger (same group + amount +
// currency + receipt_date as a non-rejected receipt); app never sets it. Treasurer
// judges — no blocking behaviour.
export function DuplicateBadge() {
  const t = useTranslations("duplicate");
  return (
    <span className="inline-flex items-center rounded-pill bg-status-reviewed-bg px-2 py-0.5 text-xs font-medium text-status-reviewed-fg">
      {t("badge")}
    </span>
  );
}
