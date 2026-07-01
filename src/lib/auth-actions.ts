"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  // i18n key under the "auth" namespace, e.g. "invalidCredentials".
  error?: string;
  sent?: boolean;
}

// Only allow internal, single-slash relative redirects (no open redirect).
function safePath(raw: FormDataEntryValue | null): string {
  const p = typeof raw === "string" ? raw : "";
  return p.startsWith("/") && !p.startsWith("//") ? p : "/";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safePath(formData.get("redirect"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "invalidCredentials" };

  redirect(redirectTo);
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    (hdrs.get("host") ? `https://${hdrs.get("host")}` : "");

  const supabase = await createClient();
  // Errors here are intentionally not surfaced — don't reveal which emails exist.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });

  return { sent: true };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "genericError" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "genericError" };

  redirect("/");
}
