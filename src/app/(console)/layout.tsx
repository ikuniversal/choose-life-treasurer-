import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ConsoleNav } from "@/components/console/console-nav";
import { ContextSwitcher } from "@/components/console/context-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NoAccess } from "@/components/auth/no-access";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  canAccessConsole,
  consoleAssignments,
  getSessionUser,
  hasAnyRole,
} from "@/lib/auth";
import { contextKey } from "@/lib/context";
import { getActiveContext } from "@/lib/context-server";

// Console shell — Treasurer/Admin. Sidebar at ≥880px collapses to a top
// tab-strip below. Real Supabase Auth gating: middleware redirects
// unauthenticated traffic; here we sort authenticated users by role.
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [t, user] = await Promise.all([
    getTranslations("console"),
    getSessionUser(),
  ]);

  // Zero roles → clear no-access state. Member-only (no console role) → send them
  // to their own app rather than an "access denied" dead end.
  if (!hasAnyRole(user)) return <NoAccess />;
  if (!canAccessConsole(user)) redirect("/");

  const assignments = consoleAssignments(user);
  const active = await getActiveContext(assignments);
  const activeKey = active ? contextKey(active) : "";

  return (
    <div className="flex min-h-full flex-col bg-canvas min-[880px]:flex-row">
      {/* Sidebar — dark, ≥880px only */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 min-[880px]:flex">
        <span className="text-sm font-semibold text-canvas">{t("title")}</span>
        <ContextSwitcher assignments={assignments} activeKey={activeKey} />
        <ConsoleNav variant="sidebar" />
        <div className="mt-auto flex items-center justify-between gap-2">
          <LocaleSwitcher className="border-white/15" />
          <SignOutButton />
        </div>
      </aside>

      {/* Tab-strip — below 880px */}
      <div className="flex flex-col gap-2 border-b border-hairline px-4 py-2 min-[880px]:hidden">
        <div className="flex items-center justify-between gap-3">
          <ConsoleNav variant="strip" />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <SignOutButton />
          </div>
        </div>
        <ContextSwitcher
          assignments={assignments}
          activeKey={activeKey}
          tone="light"
        />
      </div>

      <main className="flex-1 p-4 min-[880px]:p-8">{children}</main>
    </div>
  );
}
