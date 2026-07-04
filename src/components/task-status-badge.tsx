import { useTranslations } from "next-intl";
import type { TaskStatus } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

// Reskin: solid filled badge — assigned→gold, done→blue-gray, approved→green.
const PILL: Record<TaskStatus, string> = {
  assigned: "bg-status-pending-dot text-white",
  done: "bg-status-reviewed-dot text-white",
  approved: "bg-status-approved-dot text-white",
};

// Client component (uses useTranslations) — safe inside the intl provider.
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("taskStatus");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        PILL[status],
      )}
    >
      {t(status)}
    </span>
  );
}
