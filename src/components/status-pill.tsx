import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type ItemStatus = Database["public"]["Enums"]["item_status"];

// Status pill on the locked "Ledger" tokens: 2px swatch dot + tinted bg/fg.
const PILL: Record<ItemStatus, string> = {
  pending: "bg-status-pending-bg text-status-pending-fg",
  reviewed: "bg-status-reviewed-bg text-status-reviewed-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
};

const DOT: Record<ItemStatus, string> = {
  pending: "bg-status-pending-dot",
  reviewed: "bg-status-reviewed-dot",
  approved: "bg-status-approved-dot",
  rejected: "bg-status-rejected-dot",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: ItemStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
        PILL[status],
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-swatch", DOT[status])}
        aria-hidden
      />
      {label}
    </span>
  );
}
