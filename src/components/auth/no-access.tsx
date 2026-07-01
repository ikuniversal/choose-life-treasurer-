import { getTranslations } from "next-intl/server";
import { SignOutButton } from "./sign-out-button";

// Shown to a signed-in user who has zero role assignments — a clear "contact
// your Admin" state, never a raw error.
export async function NoAccess() {
  const t = await getTranslations("auth");
  return (
    <div className="flex min-h-full items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm rounded-card border border-hairline bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-ink">{t("noAccessTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("noAccessBody")}</p>
        <div className="mt-5 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
