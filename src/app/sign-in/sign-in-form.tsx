"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type AuthState } from "@/lib/auth-actions";
import { Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export function SignInForm({
  redirectTo,
  linkError,
}: {
  redirectTo: string;
  linkError?: string;
}) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    {},
  );
  const errorKey = state.error ?? linkError;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <Field
        label={t("email")}
        type="email"
        name="email"
        required
        autoComplete="email"
      />
      <Field
        label={t("password")}
        type="password"
        name="password"
        required
        autoComplete="current-password"
      />
      {errorKey && <p className="text-sm text-reject">{t(errorKey)}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("signingIn") : t("signInButton")}
      </Button>
      <Link
        href="/reset-password"
        className="text-center text-sm text-olive hover:underline"
      >
        {t("forgotPassword")}
      </Link>
    </form>
  );
}
