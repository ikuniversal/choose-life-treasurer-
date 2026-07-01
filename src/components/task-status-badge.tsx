import { useTranslations } from "next-intl";
import type { TaskStatus } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

// Task status on the locked tokens: assigned→amber, done→blue, approved→green.
const PILL: Record<TaskStatus, string> = {
  assigned: "bg-status-pending-bg text-status-pending-fg",
  done: "bg-status-reviewed-bg text-status-reviewed-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
};

const DOT: Record<TaskStatus, string> = {
  assigned: "bg-status-pending-dot",
  done: "bg-status-reviewed-dot",
  approved: "bg-status-approved-dot",
};

// Client component (uses useTranslations) — safe inside the intl provider.
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("taskStatus");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
        PILL[status],
      )}
    >
      <span className={cn("h-2 w-2 rounded-swatch", DOT[status])} aria-hidden />
      {t(status)}
    </span>
  );
}
