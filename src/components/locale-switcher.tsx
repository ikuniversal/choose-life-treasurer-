"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { en: "EN", ru: "RU" };

export function LocaleSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-pill border border-hairline p-0.5",
        className,
      )}
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setLocale(loc))}
          className={cn(
            "rounded-pill px-2.5 py-1 text-xs font-medium transition-colors",
            active === loc
              ? "bg-olive text-canvas"
              : "text-muted hover:text-body",
          )}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
