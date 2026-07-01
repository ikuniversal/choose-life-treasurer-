"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Console navigation. Renders as a vertical rail inside the ≥880px sidebar and
// as a horizontal tab-strip below that breakpoint — same links, one source.
// The Users & Roles link is Admin-only (Treasurers reach the console but not it).
export function ConsoleNav({
  variant,
  isAdmin,
}: {
  variant: "sidebar" | "strip";
  isAdmin: boolean;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = [
    { href: "/console", label: t("console"), icon: LayoutDashboard },
    { href: "/console/review", label: t("review"), icon: ClipboardCheck },
    { href: "/console/tasks", label: t("tasks"), icon: ListChecks },
    { href: "/console/budgets", label: t("budgets"), icon: PiggyBank },
    ...(isAdmin
      ? [
          { href: "/console/projects", label: t("projects"), icon: FolderKanban },
          { href: "/console/users", label: t("users"), icon: Users },
        ]
      : []),
  ];

  return (
    <nav
      className={cn(
        variant === "sidebar"
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto",
      )}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/console"
            ? pathname === "/console"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-input px-3 py-2 text-sm transition-colors",
              variant === "sidebar" &&
                (active
                  ? "bg-white/10 text-canvas"
                  : "text-faint hover:bg-white/5 hover:text-canvas"),
              variant === "strip" &&
                "whitespace-nowrap " +
                  (active
                    ? "bg-olive/15 text-olive"
                    : "text-muted hover:bg-hairline-row hover:text-body"),
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
