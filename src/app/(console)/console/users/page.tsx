import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { canAccessConsole, getSessionUser, isOrgAdmin } from "@/lib/auth";
import {
  getGroupOptions,
  getProjectOptions,
  getUsersOverview,
} from "@/lib/data/users";
import { getTreasurerRoster } from "@/lib/data/treasurer-roster";
import { getProjectAdminView } from "@/lib/data/project-admin";
import { InviteForm } from "./invite-form";
import { UserRoleChips } from "./user-role-chips";
import { DeleteUserButton } from "./delete-user-button";
import { RemoveMemberButton } from "./remove-member-button";
import { ProjectAdminManager } from "./project-admin-manager";

export default async function UsersPage() {
  // Admin, project_admin, and treasurer all reach this page (the console layout
  // gates out pure members); each sees a different, role-scoped view.
  const me = await getSessionUser();
  if (!canAccessConsole(me)) redirect("/");
  const isAdmin = isOrgAdmin(me);
  const isProjectAdmin =
    !isAdmin && !!me && me.assignments.some((a) => a.role === "project_admin");

  const t = await getTranslations("users");

  // ── Project Admin view: their project's groups + treasurer/member management.
  if (isProjectAdmin) {
    const projects = await getProjectAdminView();
    return <ProjectAdminManager projects={projects} />;
  }

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

  // ── Admin view: invite (now incl. Project Admin), full user list, delete
  //    user, role chips. Unchanged apart from the invite form's project picker.
  const [users, groups, projects] = await Promise.all([
    getUsersOverview(),
    getGroupOptions(),
    getProjectOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>

      <InviteForm groups={groups} projects={projects} />

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
