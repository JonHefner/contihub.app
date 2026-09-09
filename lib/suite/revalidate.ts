import { revalidatePath } from "next/cache";
import type { SuiteAppKey } from "@/lib/projects";
import { projectHref } from "@/lib/projects";
import { readString } from "@/lib/suite/form";

export function readProjectId(formData: FormData) {
  return readString(formData, "projectId") || null;
}

export function revalidateSuite(app: SuiteAppKey, projectId?: string | null) {
  revalidatePath(`/app/${app}`);
  revalidatePath("/app/projects");
  if (projectId) {
    revalidatePath(projectHref(projectId));
    revalidatePath(projectHref(projectId, app));
    if (app === "field") {
      revalidatePath(`${projectHref(projectId, "field")}/rfis`);
    }
  }
}
