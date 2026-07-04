import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared stat tile (reskin) — reused across dashboard / review / export / tasks.
// Uppercase gray label, large bold value below. `tone` shifts the value colour
// for attention states (gold = watch, danger = over-budget/needs attention).
const VALUE_TONE = {
  default: "text-ink",
  gold: "text-amber",
  danger: "text-reject",
} as const;

export function StatCard({
  label,
  value,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  tone?: keyof typeof VALUE_TONE;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-card-lg bg-card p-5 shadow-card",
        className,
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className={cn("num text-3xl font-bold leading-none", VALUE_TONE[tone])}>
        {value}
      </span>
    </div>
  );
}
