"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  createGroup,
  createProject,
  renameProject,
  updateGroup,
  type ProjectResult,
} from "@/lib/project-actions";
import type { ProjectRow } from "@/lib/data/projects";

const inputCls =
  "h-10 w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-olive focus:ring-2 focus:ring-olive/30";

export function ProjectsManager({ projects }: { projects: ProjectRow[] }) {
  const t = useTranslations("projects");
  const router = useRouter();
  const createRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [addGroupFor, setAddGroupFor] = useState<string | null>(null);

  async function handle(
    result: Promise<ProjectResult>,
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
      {error && <p className="text-sm text-reject">{t(error)}</p>}

      {/* Create project */}
      <form
        ref={createRef}
        action={(fd) => handle(createProject(fd), () => createRef.current?.reset())}
        className="flex flex-col gap-2 rounded-card border border-hairline bg-card p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm text-body">{t("newProject")}</span>
          <input name="name" required placeholder={t("projectName")} className={inputCls} />
        </label>
        <Button type="submit">{t("create")}</Button>
      </form>

      {projects.length === 0 ? (
        <p className="rounded-card border border-hairline bg-card px-4 py-6 text-center text-sm text-muted">
          {t("noProjects")}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-card border border-hairline bg-card p-4"
            >
              {/* Project header / rename */}
              {renameId === project.id ? (
                <form
                  action={(fd) => handle(renameProject(fd), () => setRenameId(null))}
                  className="flex flex-col gap-2 sm:flex-row sm:items-end"
                >
                  <input type="hidden" name="id" value={project.id} />
                  <input
                    name="name"
                    required
                    defaultValue={project.name}
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {t("save")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRenameId(null)}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  {/* project name is UGC — never translated */}
                  <h2 className="truncate font-semibold text-ink">
                    {project.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRenameId(project.id);
                      setEditGroupId(null);
                      setAddGroupFor(null);
                    }}
                  >
                    {t("rename")}
                  </Button>
                </div>
              )}

              {/* Groups */}
              <ul className="mt-3 flex flex-col divide-y divide-hairline-row border-t border-hairline-row">
                {project.groups.length === 0 && (
                  <li className="py-2 text-sm text-muted">{t("noGroups")}</li>
                )}
                {project.groups.map((group) =>
                  editGroupId === group.id ? (
                    <li key={group.id} className="py-3">
                      <form
                        action={(fd) =>
                          handle(updateGroup(fd), () => setEditGroupId(null))
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
                            className={`${inputCls} font-mono`}
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
                    </li>
                  ) : (
                    <li
                      key={group.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-ink">{group.name}</p>
                        <p className="text-xs text-muted">
                          <span className="font-mono">
                            {group.spendingLimit != null
                              ? group.spendingLimit.toFixed(2)
                              : t("noLimit")}
                          </span>
                          {" · "}
                          <span className="font-mono">
                            {group.submissionDeadline ?? t("noDeadline")}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditGroupId(group.id);
                          setRenameId(null);
                          setAddGroupFor(null);
                        }}
                      >
                        {t("edit")}
                      </Button>
                    </li>
                  ),
                )}
              </ul>

              {/* Add group */}
              {addGroupFor === project.id ? (
                <form
                  action={(fd) => handle(createGroup(fd), () => setAddGroupFor(null))}
                  className="mt-3 flex flex-col gap-2 rounded-input bg-hairline-row/50 p-3"
                >
                  <input type="hidden" name="projectId" value={project.id} />
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
                      className={`${inputCls} font-mono`}
                    />
                    <input
                      name="deadline"
                      type="date"
                      className={inputCls}
                    />
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
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddGroupFor(project.id);
                      setRenameId(null);
                      setEditGroupId(null);
                    }}
                  >
                    {t("addGroup")}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
