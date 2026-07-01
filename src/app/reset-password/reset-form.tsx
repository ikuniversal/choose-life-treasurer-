"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset, type AuthState } from "@/lib/auth-actions";
import { Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export function ResetForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-body">{t("resetSent")}</p>
        <Link
          href="/sign-in"
          className="text-center text-sm text-olive hover:underline"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t("resetIntro")}</p>
      <Field
        label={t("email")}
        type="email"
        name="email"
        required
        autoComplete="email"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {t("resetButton")}
      </Button>
      <Link
        href="/sign-in"
        className="text-center text-sm text-olive hover:underline"
      >
        {t("backToSignIn")}
      </Link>
    </form>
  );
}
