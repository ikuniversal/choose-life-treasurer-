import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type ItemStatus = Database["public"]["Enums"]["item_status"];

// Reskin: solid, filled status pill — colored fill + white text per status
// (green=approved, gold=pending, blue-gray=reviewed, terracotta=rejected).
const PILL: Record<ItemStatus, string> = {
  pending: "bg-status-pending-dot text-white",
  reviewed: "bg-status-reviewed-dot text-white",
  approved: "bg-status-approved-dot text-white",
  rejected: "bg-status-rejected-dot text-white",
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
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        PILL[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
