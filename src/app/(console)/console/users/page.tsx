import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { canAccessConsole, getSessionUser } from "@/lib/auth";
import { getGroupOptions, getUsersOverview } from "@/lib/data/users";
import { getTreasurerRoster } from "@/lib/data/treasurer-roster";
import { InviteForm } from "./invite-form";
import { UserRoleChips } from "./user-role-chips";
import { DeleteUserButton } from "./delete-user-button";
import { RemoveMemberButton } from "./remove-member-button";

export default async function UsersPage() {
  // Treasurers and admins reach this page (the console layout already gates out
  // pure members); the two roles see very different views.
  const me = await getSessionUser();
  if (!canAccessConsole(me)) redirect("/");
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");

  const t = await getTranslations("users");

  // ── Treasurer view: their group roster(s), remove-member on members only.
  if (!isAdmin) {
    const roster = await getTreasurerRoster();
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-ink">{t("rosterTitle")}</h1>

        {roster.length === 0 ? (
          <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
            {t("noGroupMembers")}
          </p>
        ) : (
          roster.map((group) => (
            <section key={group.groupId} className="flex flex-col gap-2">
              {/* group name is UGC — never translated */}
              <h2 className="text-sm font-semibold text-muted">
                {group.groupName}
              </h2>
              {group.members.length === 0 ? (
                <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
                  {t("noGroupMembers")}
                </p>
              ) : (
                <ul className="overflow-hidden rounded-card-lg bg-card shadow-card">
                  {group.members.map((m) => (
                    <li
                      key={m.userId}
                      className="flex flex-col gap-2 border-b border-hairline-row px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* member name is UGC — never translated */}
                      <p className="truncate text-sm font-medium text-ink">
                        {m.fullName ?? m.userId}
                      </p>
                      <RemoveMemberButton
                        userId={m.userId}
                        groupId={group.groupId}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </div>
    );
  }

  // ── Admin view: unchanged — invite, full user list, delete user, role chips.
  const [users, groups] = await Promise.all([
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
              {/* Tap a user → their per-user activity view (#57, admin-only). */}
              <Link href={`/console/users/${u.id}`} className="group min-w-0">
                {/* name + email are UGC — never translated */}
                <p className="truncate text-sm font-medium text-ink transition-colors group-hover:text-olive">
                  {u.fullName ?? u.email ?? u.id}
                </p>
                {u.email && (
                  <p className="truncate font-mono text-xs text-faint">
                    {u.email}
                  </p>
                )}
              </Link>

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
