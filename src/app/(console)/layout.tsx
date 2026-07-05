import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ConsoleNav } from "@/components/console/console-nav";
import { ContextSwitcher } from "@/components/console/context-switcher";
import { RoleBadge } from "@/components/console/role-badge";
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
  const [tRoles, user] = await Promise.all([
    getTranslations("roles"),
    getSessionUser(),
  ]);

  // Zero roles → clear no-access state. Member-only (no console role) → send them
  // to their own app rather than an "access denied" dead end.
  if (!hasAnyRole(user)) return <NoAccess />;
  if (!canAccessConsole(user)) redirect("/");

  const assignments = consoleAssignments(user);
  const active = await getActiveContext(assignments);
  const activeKey = active ? contextKey(active) : "";
  const isAdmin = !!user && user.assignments.some((a) => a.role === "admin");
  // Role indicator pill — the viewer's actual authenticated role (no switcher).
  const roleLabel = tRoles(isAdmin ? "admin" : "treasurer");

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      {/* Reskin: one top shell for every breakpoint — wordmark + role/locale/
          sign-out header, then a horizontally-scrollable nav pill row that
          visually replaces the old dark sidebar. Routes, links, and role gating
          are unchanged; the group ContextSwitcher is preserved below the nav. */}
      <header className="flex flex-col gap-3 border-b border-hairline bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-ink">Choose Life</span>
          <div className="flex items-center gap-2">
            <RoleBadge label={roleLabel} />
            <LocaleSwitcher />
            <SignOutButton />
          </div>
        </div>
        <ConsoleNav isAdmin={isAdmin} />
        <ContextSwitcher
          assignments={assignments}
          activeKey={activeKey}
          tone="light"
        />
      </header>

      <main className="flex-1 p-4 min-[880px]:p-8">{children}</main>
    </div>
  );
}
