import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { getMemberLedger } from "@/lib/data/member-ledger";

export default async function MemberHomePage() {
  const [t, tStatus, ledger] = await Promise.all([
    getTranslations("member"),
    getTranslations("status"),
    getMemberLedger(),
  ]);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-body">{t("tagline")}</p>

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

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">{t("ledgerTitle")}</h2>

        {!ledger.signedIn ? (
          <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
            {t("signedOut")}
          </p>
        ) : ledger.items.length === 0 ? (
          <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
            {t("empty")}
          </p>
        ) : (
          <ul className="overflow-hidden rounded-card border border-hairline bg-card">
            {ledger.items.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className="flex items-center justify-between gap-3 border-b border-hairline-row px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  {/* title is UGC (vendor / note description) — never translated */}
                  <p className="truncate text-sm font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="font-mono text-xs text-faint">{item.date}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.amount !== null && (
                    <span className="font-mono text-sm text-olive">
                      {item.amount.toFixed(2)} {item.currency}
                    </span>
                  )}
                  <StatusPill status={item.status} label={tStatus(item.status)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
