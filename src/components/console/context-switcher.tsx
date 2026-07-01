"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { RoleAssignment } from "@/lib/auth";
import { contextKey } from "@/lib/context";
import { setActiveContext } from "@/lib/context-actions";
import { cn } from "@/lib/utils";

// Real context switcher: it moves between the user's ACTUAL assignments only.
// Single-assignment users get a static label (no switcher, no pretend-role).
// `tone` matches the surface — dark sidebar vs light mobile tab-strip.
export function ContextSwitcher({
  assignments,
  activeKey,
  tone = "dark",
}: {
  assignments: RoleAssignment[];
  activeKey: string;
  tone?: "dark" | "light";
}) {
  const t = useTranslations("roles");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const label = (a: RoleAssignment) =>
    a.groupName ? `${t(a.role)} · ${a.groupName}` : t(a.role);

  const active = assignments.find((a) => contextKey(a) === activeKey);

  if (assignments.length <= 1) {
    return (
      <span
        className={cn(
          "block truncate rounded-input px-3 py-2 text-sm",
          tone === "dark"
            ? "bg-white/5 text-faint"
            : "bg-hairline-row text-muted",
        )}
      >
        {active ? label(active) : ""}
      </span>
    );
  }

  return (
    <select
      value={activeKey}
      disabled={pending}
      onChange={(e) => {
        const key = e.target.value;
        startTransition(async () => {
          await setActiveContext(key);
          router.refresh();
        });
      }}
      className={cn(
        "w-full rounded-input border px-3 py-2 text-sm outline-none focus:border-olive",
        tone === "dark"
          ? "border-white/15 bg-white/5 text-canvas"
          : "border-hairline bg-card text-ink",
      )}
    >
      {assignments.map((a) => {
        const key = contextKey(a);
        return (
          <option key={key} value={key} className="text-ink">
            {label(a)}
          </option>
        );
      })}
    </select>
  );
}
