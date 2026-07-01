import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("resetTitle")}>
      <ResetForm />
    </AuthShell>
  );
}
