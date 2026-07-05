"use client";

import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  /** Optional trailing count badge. */
  count?: number;
}

// Reskin primitive: a horizontally-scrollable row of filter pills (same visual
// language as the console nav row). Active = solid dark pill, inactive = cream.
// Controlled — the parent owns the selected value and does the filtering.
export function FilterPillRow({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-2 overflow-x-auto", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-ink text-white"
                : "bg-hairline-row text-body hover:bg-hairline",
            )}
          >
            {o.label}
            {o.count != null && (
              <span
                className={cn(
                  "num text-xs",
                  active ? "text-white/70" : "text-muted",
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
