"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  paAssignRole,
  paCreateGroup,
  paDeleteGroup,
  paRemoveRole,
  paUpdateGroup,
  type PaResult,
} from "@/lib/project-admin-actions";
import type { PaProject } from "@/lib/data/project-admin";

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

// Project Admin view of /console/users: group lifecycle + treasurer/member role
// management, all scoped (by RLS) to the admin's own project. No project create/
// rename/delete (they manage groups within their project) and no invite-new-user
// form (existing users only). Reuses the guarded-delete pattern from
// /console/projects and the remove-role pattern from #57.
export function ProjectAdminManager({ projects }: { projects: PaProject[] }) {
  const t = useTranslations("projectAdmin");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [addGroupFor, setAddGroupFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handle(
    result: Promise<PaResult>,
    onOk: () => void,
  ): Promise<void> {
    const r = await result;
    if (r.error) {
      setError(r.error);
      return;
    }
    setError(null);
    onOk();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
        <p className="text-sm text-muted">{t("intro")}</p>
      </div>

      {error && <p className="text-sm text-reject">{t(error)}</p>}

      {projects.map((project) => (
        <section key={project.projectId} className="flex flex-col gap-3">
          {/* project name is UGC — never translated */}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber">
            {project.projectName}
          </h2>

          {project.groups.length === 0 ? (
            <p className="rounded-card-lg bg-card px-4 py-6 text-center text-sm text-muted shadow-card">
              {t("noGroups")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {project.groups.map((group) => (
                <li
                  key={group.id}
                  className="flex flex-col gap-3 rounded-card-lg bg-card p-4 shadow-card"
                >
                  {editGroupId === group.id ? (
                    <form
                      action={(fd) =>
                        handle(paUpdateGroup(fd), () => setEditGroupId(null))
                      }
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="id" value={group.id} />
                      <input
                        name="name"
                        required
                        defaultValue={group.name}
                        placeholder={t("groupName")}
                        className={inputCls}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          name="spendingLimit"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          defaultValue={group.spendingLimit ?? ""}
                          placeholder={t("spendingLimit")}
                          className={`${inputCls} num`}
                        />
                        <input
                          name="deadline"
                          type="date"
                          defaultValue={group.submissionDeadline ?? ""}
                          className={inputCls}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          {t("save")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditGroupId(null)}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {/* group name is UGC — never translated */}
                          <p className="truncate text-sm font-medium text-ink">
                            {group.name}
                          </p>
                          <p className="text-xs text-muted">
                            <span className="num">
                              {group.spendingLimit != null
                                ? group.spendingLimit.toFixed(2)
                                : t("noLimit")}
                            </span>
                            {" · "}
                            <span className="num">
                              {group.submissionDeadline ?? t("noDeadline")}
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditGroupId(group.id);
                              setAddGroupFor(null);
                            }}
                          >
                            {t("edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(group.id)}
                          >
                            {t("delete")}
                          </Button>
                        </div>
                      </div>

                      {confirmDeleteId === group.id && (
                        <div className="flex flex-col gap-2 rounded-input bg-hairline-row/50 p-3">
                          <p className="text-xs text-body">
                            {t("deleteGroupWarn")}
                          </p>
                          <form
                            action={(fd) =>
                              handle(paDeleteGroup(fd), () =>
                                setConfirmDeleteId(null),
                              )
                            }
                            className="flex gap-2"
                          >
                            <input type="hidden" name="id" value={group.id} />
                            <Button type="submit" variant="reject" size="sm">
                              {t("confirmDelete")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              {t("cancel")}
                            </Button>
                          </form>
                        </div>
                      )}

                      {/* Roster: treasurer/member role rows for this group. */}
                      <div className="flex flex-col gap-1.5 border-t border-hairline-row pt-3">
                        <span className="text-xs font-semibold text-muted">
                          {t("roster")}
                        </span>
                        {group.roster.length === 0 ? (
                          <p className="text-xs text-muted">{t("noRoster")}</p>
                        ) : (
                          <ul className="flex flex-col gap-1.5">
                            {group.roster.map((m) => (
                              <li
                                key={m.roleId}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  {/* name is UGC (or a short id fallback) */}
                                  <span className="truncate text-sm text-ink">
                                    {m.name ?? `${t("userShort")} ${m.userId.slice(0, 8)}`}
                                  </span>
                                  <span className="shrink-0 rounded-pill bg-hairline-row px-2 py-0.5 text-xs text-body">
                                    {t(m.role)}
                                  </span>
                                </span>
                                <span className="flex shrink-0 items-center gap-1">
                                  {m.role === "member" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handle(
                                          paAssignRole(
                                            m.userId,
                                            group.id,
                                            "treasurer",
                                          ),
                                          () => {},
                                        )
                                      }
                                      className="text-xs text-olive transition-colors hover:text-ink"
                                    >
                                      {t("makeTreasurer")}
                                    </button>
                                  )}
                                  <RemoveRole roleId={m.roleId} onDone={handle} />
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add group to this project */}
          {addGroupFor === project.projectId ? (
            <form
              action={(fd) =>
                handle(paCreateGroup(fd), () => setAddGroupFor(null))
              }
              className="flex flex-col gap-2 rounded-input bg-hairline-row/50 p-3"
            >
              <input type="hidden" name="projectId" value={project.projectId} />
              <input
                name="name"
                required
                placeholder={t("groupName")}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="spendingLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder={t("spendingLimit")}
                  className={`${inputCls} num`}
                />
                <input name="deadline" type="date" className={inputCls} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  {t("create")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddGroupFor(null)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddGroupFor(project.projectId);
                  setEditGroupId(null);
                }}
              >
                {t("addGroup")}
              </Button>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

// Small confirm-inline remove for a role row (member OR treasurer).
function RemoveRole({
  roleId,
  onDone,
}: {
  roleId: string;
  onDone: (result: Promise<PaResult>, onOk: () => void) => Promise<void>;
}) {
  const t = useTranslations("projectAdmin");
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() =>
            onDone(paRemoveRole(roleId), () => setConfirming(false))
          }
          className="text-xs font-medium text-reject transition-colors hover:text-reject"
        >
          {t("confirmRemove")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-muted transition-colors hover:text-ink"
        >
          {t("cancel")}
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-muted transition-colors hover:text-reject"
    >
      {t("remove")}
    </button>
  );
}
