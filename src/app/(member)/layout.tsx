import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, Home, Receipt } from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NoAccess } from "@/components/auth/no-access";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSessionUser, hasAnyRole } from "@/lib/auth";

// Member shell — phone-first. Content is a fluid column capped at the design's
// 312px (var --spacing-member → max-w-member). A drop shadow is allowed here:
// this is the phone frame surface (PROJECT_STATE §8 exception).
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already redirects unauthenticated traffic to /sign-in; a signed-in
  // user with zero roles gets the clear no-access state rather than an empty app.
  const user = await getSessionUser();
  if (!hasAnyRole(user)) return <NoAccess />;

  const t = await getTranslations("nav");
  const tabs = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/capture", label: t("capture"), icon: Camera },
    { href: "/receipts", label: t("receipts"), icon: Receipt },
  ];

  return (
    <div className="flex min-h-full flex-col items-center bg-canvas">
      <div className="flex w-full max-w-member flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-ink">Choose Life</span>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 px-4 pb-24">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-member items-center justify-around border-t border-hairline bg-card/95 px-2 py-2 backdrop-blur">
          {tabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-muted transition-colors hover:text-olive"
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
