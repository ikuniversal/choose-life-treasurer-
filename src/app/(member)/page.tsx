import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MemberHomePage() {
  const t = await getTranslations("member");

  return (
    <div className="flex flex-col gap-5 pt-2">
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
    </div>
  );
}
