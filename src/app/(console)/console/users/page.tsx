import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { X } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { removeRole } from "@/lib/admin-actions";
import { getGroupOptions, getUsersOverview } from "@/lib/data/users";
import { InviteForm } from "./invite-form";

export default async function UsersPage() {
  // Admin-only — Treasurers reach the console but not this page.
  const me = await getSessionUser();
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  if (!isAdmin) redirect("/console");

  const [t, tRoles, users, groups] = await Promise.all([
    getTranslations("users"),
    getTranslations("roles"),
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

              <div className="flex flex-wrap items-center gap-2">
                {u.chips.length === 0 && (
                  <span className="text-xs text-muted">{t("noRoles")}</span>
                )}
                {u.chips.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-hairline-row px-2.5 py-1 text-xs text-body"
                  >
                    <span className="font-medium text-olive">
                      {tRoles(c.role)}
                    </span>
                    {c.groupName && (
                      <span className="text-muted">· {c.groupName}</span>
                    )}
                    <form action={removeRole}>
                      <input type="hidden" name="roleId" value={c.id} />
                      <button
                        type="submit"
                        aria-label={t("remove")}
                        title={t("remove")}
                        className="ml-0.5 rounded-full p-0.5 text-muted transition-colors hover:text-reject"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </form>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
