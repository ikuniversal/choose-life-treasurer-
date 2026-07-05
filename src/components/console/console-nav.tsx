"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ClipboardCheck,
  Coins,
  Download,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  PiggyBank,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Console navigation (reskin) — a single horizontally-scrollable pill row of the
// EXISTING links per role. Active route = solid dark pill; inactive = cream pill.
// Links + role gating are unchanged; Users & Roles stays Admin-only.
export function ConsoleNav({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = [
    { href: "/console", label: t("console"), icon: LayoutDashboard },
    { href: "/console/review", label: t("review"), icon: ClipboardCheck },
    { href: "/console/tasks", label: t("tasks"), icon: ListChecks },
    { href: "/console/chat", label: t("chat"), icon: MessageCircle },
    { href: "/console/export", label: t("export"), icon: Download },
    { href: "/console/budgets", label: t("budgets"), icon: PiggyBank },
    ...(isAdmin
      ? [
          { href: "/console/projects", label: t("projects"), icon: FolderKanban },
          { href: "/console/rates", label: t("rates"), icon: Coins },
          { href: "/console/users", label: t("users"), icon: Users },
        ]
      : []),
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto">
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
              "flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-ink text-white"
                : "bg-hairline-row text-body hover:bg-hairline",
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
