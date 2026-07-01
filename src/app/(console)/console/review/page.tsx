import { getTranslations } from "next-intl/server";
import { getReviewQueue } from "@/lib/data/review";
import { getNoteReviewQueue } from "@/lib/data/note-review";
import { ReviewQueue } from "./review-queue";
import { NotesReview } from "./notes-review";

// Console is already gated to treasurer/admin by the (console) layout; RLS
// scopes both queues (treasurer → their groups, admin → all).
export default async function ReviewPage() {
  const [t, tNotes, receipts, notes] = await Promise.all([
    getTranslations("review"),
    getTranslations("notes"),
    getReviewQueue(),
    getNoteReviewQueue(),
  ]);

  const emptyBox = (label: string) => (
    <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
      {label}
    </p>
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        {receipts.length === 0 ? (
          emptyBox(t("empty"))
        ) : (
          <ReviewQueue items={receipts} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">
          {tNotes("reviewTitle")}
        </h2>
        {notes.length === 0 ? (
          emptyBox(tNotes("empty"))
        ) : (
          <NotesReview items={notes} />
        )}
      </section>
    </div>
  );
}
