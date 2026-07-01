import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("auth");
  const linkError = sp.error === "link_invalid" ? "linkInvalid" : undefined;

  return (
    <AuthShell title={t("signInTitle")}>
      <SignInForm redirectTo={sp.redirect ?? "/"} linkError={linkError} />
    </AuthShell>
  );
}
