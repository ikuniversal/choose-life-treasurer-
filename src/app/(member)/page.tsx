import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { CommentThread } from "@/components/comment-thread";
import { getMemberLedger } from "@/lib/data/member-ledger";
import { canAccessConsole, getSessionUser } from "@/lib/auth";

export default async function MemberHomePage() {
  const [t, tStatus, ledger, user] = await Promise.all([
    getTranslations("member"),
    getTranslations("status"),
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
          className="flex items-center justify-between rounded-card border border-hairline bg-card px-4 py-3 text-sm font-medium text-olive transition-colors hover:bg-hairline-row"
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
                className="border-b border-hairline-row px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
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
                    <StatusPill
                      status={item.status}
                      label={tStatus(item.status)}
                    />
                  </div>
                </div>
                <CommentThread
                  kind={item.kind}
                  parentId={item.id}
                  groupId={item.groupId}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
