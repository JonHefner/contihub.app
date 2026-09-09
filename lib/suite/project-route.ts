import { notFound, redirect } from "next/navigation";
import { projectHref, type SuiteAppKey } from "@/lib/projects";
import { getProject, listProjects } from "@/lib/suite/store";
import type { PersistMode, Project } from "@/lib/suite/types";

export async function loadProject(id: string) {
  const project = await getProject(id);
  if (!project) {
    notFound();
  }
  return project;
}

export async function listOrRedirectToProject(
  app: SuiteAppKey,
): Promise<{ projects: Project[]; persist: PersistMode }> {
  const { rows, persist } = await listProjects();
  if (rows.length === 1) {
    redirect(projectHref(rows[0].id, app));
  }
  return { projects: rows, persist };
}
