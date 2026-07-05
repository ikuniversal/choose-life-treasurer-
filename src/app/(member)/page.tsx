import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencyConverter } from "@/components/currency-converter";
import { getMemberLedger } from "@/lib/data/member-ledger";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import { LedgerList } from "./ledger-list";

export default async function MemberHomePage() {
  const [t, ledger, user] = await Promise.all([
    getTranslations("member"),
    getMemberLedger(),
    getSessionUser(),
  ]);

  // Console entry — only for treasurers/admins (reuses PR #5 role detection).
  const showConsole = canAccessConsole(user);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body">{t("tagline")}</p>

      {showConsole && (
        <Link
          href="/console"
          className="flex items-center justify-between rounded-card-lg bg-card px-4 py-3 text-sm font-medium text-olive shadow-card transition-colors hover:bg-hairline-row"
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" aria-hidden />
            {t("goToConsole")}
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href="/capture">
            <Camera className="h-5 w-5" aria-hidden />
            {t("newReceipt")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/no-receipt">
            <FileText className="h-5 w-5" aria-hidden />
            {t("noReceiptNote")}
          </Link>
        </Button>
      </div>

      {/* Convert local spend → USD before capturing a receipt (read-only). */}
      <CurrencyConverter />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t("ledgerTitle")}</h2>

        {!ledger.signedIn ? (
          <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
            {t("signedOut")}
          </p>
        ) : ledger.items.length === 0 ? (
          <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
            {t("empty")}
          </p>
        ) : (
          <LedgerList items={ledger.items} />
        )}
      </section>
    </div>
  );
}
