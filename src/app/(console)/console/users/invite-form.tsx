"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { inviteUser, type InviteState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import type { GroupOption } from "@/lib/data/users";
import type { Database } from "@/lib/supabase/database.types";

type Role = Database["public"]["Enums"]["app_role"];
const ROLES: Role[] = ["admin", "treasurer", "member"];

export function InviteForm({ groups }: { groups: GroupOption[] }) {
  const t = useTranslations("users");
  const tRoles = useTranslations("roles");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<InviteState, FormData>(
    inviteUser,
    {},
  );

  // Reset the form once an invite succeeds.
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
          <select name="role" defaultValue="member" className={inputCls}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {tRoles(r)}
              </option>
            ))}
          </select>
        </label>
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
