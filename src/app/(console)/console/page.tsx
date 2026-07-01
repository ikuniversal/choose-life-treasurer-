import { getTranslations } from "next-intl/server";

export default async function ConsoleHomePage() {
  const t = await getTranslations("console");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>

      <section className="rounded-card border border-hairline bg-card p-5">
        <h2 className="text-sm font-medium text-muted">{t("pendingReview")}</h2>
        <p className="mt-2 font-mono text-3xl text-olive">0</p>
      </section>
    </div>
  );
}
