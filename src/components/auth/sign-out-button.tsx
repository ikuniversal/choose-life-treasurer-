import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

// Sign-out is a POST to the route handler (mutating action → not a GET link).
export async function SignOutButton({
  className,
}: {
  className?: string;
}) {
  const t = await getTranslations("auth");
  return (
    <form action="/auth/sign-out" method="post" className={className}>
      <Button type="submit" variant="outline" size="sm">
        {t("signOut")}
      </Button>
    </form>
  );
}
