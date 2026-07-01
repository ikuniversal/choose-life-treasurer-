import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function ConsoleHomePage() {
  const t = await getTranslations("console");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <Button variant="outline" size="sm">
          {t("export")}
        </Button>
      </div>

      <section className="rounded-card border border-hairline bg-card p-5">
        <h2 className="text-sm font-medium text-muted">{t("pendingReview")}</h2>
        <p className="mt-2 font-mono text-3xl text-olive">0</p>
      </section>
    </div>
  );
}
