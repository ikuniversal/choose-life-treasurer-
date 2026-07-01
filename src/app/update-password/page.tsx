import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { UpdateForm } from "./update-form";

export default async function UpdatePasswordPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("updateTitle")}>
      <UpdateForm />
    </AuthShell>
  );
}
