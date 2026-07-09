"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { inviteUser, type InviteState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import type { GroupOption } from "@/lib/data/users";
import type { Database } from "@/lib/supabase/database.types";

type Role = Database["public"]["Enums"]["app_role"];
const ROLES: Role[] = ["admin", "treasurer", "member", "project_admin"];

export function InviteForm({
  groups,
  projects,
}: {
  groups: GroupOption[];
  projects: GroupOption[];
}) {
  const t = useTranslations("users");
  const tRoles = useTranslations("roles");
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Role>("member");
  const [state, formAction, pending] = useActionState<InviteState, FormData>(
    inviteUser,
    {},
  );

  // Reset the form's native fields once an invite succeeds. (The role select is
  // controlled and keeps its last choice — handy for inviting several of a kind.)
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const inputCls =
    "h-10 rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-card border border-hairline bg-card p-4"
    >
      <h2 className="text-sm font-medium text-ink">{t("invite")}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("fullName")}</span>
          <input name="fullName" required className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("email")}</span>
          <input name="email" type="email" required className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-body">{t("role")}</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputCls}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {tRoles(r)}
              </option>
            ))}
          </select>
        </label>

        {/* A Project Admin is scoped to a PROJECT (mirrors the group picker's
            "globally" pattern, but the project pick is required); every other
            role keeps the existing group picker. */}
        {role === "project_admin" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("project")}</span>
            <select name="projectId" required defaultValue="" className={inputCls}>
              <option value="" disabled>
                {t("selectProject")}
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-body">{t("group")}</span>
            <select name="groupId" defaultValue="" className={inputCls}>
              <option value="">{t("globalOption")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {state.error && <p className="text-sm text-reject">{t(state.error)}</p>}
      {state.ok && <p className="text-sm text-approve">{t("invited")}</p>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t("inviting") : t("inviteButton")}
        </Button>
      </div>
    </form>
  );
}
