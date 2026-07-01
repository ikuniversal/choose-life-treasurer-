import { getTranslations } from "next-intl/server";
import { ConsoleNav } from "@/components/console/console-nav";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { canAccessConsole, getSessionUser } from "@/lib/auth";

// Console shell — Treasurer/Admin. Sidebar at ≥880px (min-[880px]) collapses to
// a top tab-strip below. Role gating is a STUB (PROJECT_STATE §4): the real
// Supabase Auth + RLS check replaces getSessionUser() in a follow-up PR.
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [t, user] = await Promise.all([
    getTranslations("console"),
    getSessionUser(),
  ]);

  if (!canAccessConsole(user)) {
    return (
      <div className="flex min-h-full items-center justify-center bg-canvas p-8">
        <p className="max-w-sm text-center text-muted">
          Treasurer or Admin access required.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas min-[880px]:flex-row">
      {/* Sidebar — dark, ≥880px only */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 min-[880px]:flex">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-canvas">
            {t("title")}
          </span>
        </div>
        <ConsoleNav variant="sidebar" />
        <div className="mt-auto">
          <LocaleSwitcher className="border-white/15" />
        </div>
      </aside>

      {/* Tab-strip — below 880px */}
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2 min-[880px]:hidden">
        <ConsoleNav variant="strip" />
        <LocaleSwitcher />
      </div>

      <main className="flex-1 p-4 min-[880px]:p-8">{children}</main>
    </div>
  );
}
