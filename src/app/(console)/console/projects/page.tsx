import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/auth";
import { getProjects } from "@/lib/data/projects";
import { ProjectsManager } from "./projects-manager";

export default async function ProjectsPage() {
  // Admin-only — mirrors /console/users. Treasurers reach the console but not here.
  const me = await getSessionUser();
  const isAdmin = !!me && me.assignments.some((a) => a.role === "admin");
  if (!isAdmin) redirect("/console");

  const [t, projects] = await Promise.all([
    getTranslations("projects"),
    getProjects(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
      <ProjectsManager projects={projects} />
    </div>
  );
}
