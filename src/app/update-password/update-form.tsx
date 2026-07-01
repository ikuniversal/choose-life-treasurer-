"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updatePassword, type AuthState } from "@/lib/auth-actions";
import { Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export function UpdateForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label={t("newPassword")}
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.error && <p className="text-sm text-reject">{t(state.error)}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {t("updateButton")}
      </Button>
    </form>
  );
}
