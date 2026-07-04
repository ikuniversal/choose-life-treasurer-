import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { getGroupOptions, getUsersOverview } from "@/lib/data/users";
import { InviteForm } from "./invite-form";
import { UserRoleChips } from "./user-role-chips";
import { DeleteUserButton } from "./delete-user-button";

export default async function UsersPage() {
  // Admin-only — Treasurers reach the console but not this page.
  const me = await getSessionUser();
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  if (!isAdmin) redirect("/console");

  const [t, users, groups] = await Promise.all([
    getTranslations("users"),
    getUsersOverview(),
    getGroupOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>

      <InviteForm groups={groups} />

      {users.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("noUsers")}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-card border border-hairline bg-card">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                {/* name + email are UGC — never translated */}
                <p className="truncate text-sm font-medium text-ink">
                  {u.fullName ?? u.email ?? u.id}
                </p>
                {u.email && (
                  <p className="truncate font-mono text-xs text-faint">
                    {u.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <UserRoleChips chips={u.chips} />
                <DeleteUserButton userId={u.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
