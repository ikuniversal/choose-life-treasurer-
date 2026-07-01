"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

// Client handler for the implicit flow (#access_token=&refresh_token= in the URL
// fragment). Fragments never reach the server, so /auth/confirm hands off here.
// Reads the hash directly off window.location (no useSearchParams → no Suspense
// boundary needed), establishes the session, then routes onward.
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const hash = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const query = new URLSearchParams(window.location.search);

      if (hash.get("error") || hash.get("error_code")) {
        router.replace("/sign-in?error=link_invalid");
        return;
      }

      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token && refresh_token) {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          setFailed(true);
          router.replace("/sign-in?error=link_invalid");
          return;
        }
        const type = hash.get("type");
        const dest =
          type === "recovery" || type === "invite"
            ? "/update-password"
            : safeNext(query.get("next"));
        router.replace(dest);
        return;
      }

      router.replace("/sign-in?error=link_invalid");
    };
    void run();
  }, [router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-canvas p-8">
      <p className="text-sm text-muted">
        {failed ? t("linkInvalid") : t("signingIn")}
      </p>
    </div>
  );
}
