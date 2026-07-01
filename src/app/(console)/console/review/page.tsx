import { getTranslations } from "next-intl/server";
import { getReviewQueue } from "@/lib/data/review";
import { ReviewQueue } from "./review-queue";

// Console is already gated to treasurer/admin by the (console) layout; RLS
// scopes the queue (treasurer → their groups, admin → all).
export default async function ReviewPage() {
  const [t, items] = await Promise.all([
    getTranslations("review"),
    getReviewQueue(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
      {items.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("empty")}
        </p>
      ) : (
        <ReviewQueue items={items} />
      )}
    </div>
  );
}
