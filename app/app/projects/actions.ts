"use server";

import { revalidatePath } from "next/cache";
import { isValidProjectStatus, projectHref } from "@/lib/projects";
import { readRequired, readString } from "@/lib/suite/form";
import { deleteProject, saveProject } from "@/lib/suite/store";
import type { Project, ProjectStatus } from "@/lib/suite/types";

function readProject(formData: FormData) {
  const statusValue = readString(formData, "status", "Active");
  const status: ProjectStatus = isValidProjectStatus(statusValue) ? statusValue : "Active";
  return {
    name: readRequired(formData, "name", "Project name"),
    jobNumber: readString(formData, "jobNumber"),
    address: readString(formData, "address"),
    status,
  };
}

function revalidateProject(id?: string) {
  revalidatePath("/app/projects");
  revalidatePath("/app");
  if (id) {
    revalidatePath(projectHref(id));
  }
}

export async function saveProjectAction(formData: FormData): Promise<Project> {
  const id = readString(formData, "id") || undefined;
  const project = await saveProject(readProject(formData), id);
  revalidateProject(project.id);
  return project;
}

export async function removeProjectAction(id: string) {
  await deleteProject(id);
  revalidateProject();
}
