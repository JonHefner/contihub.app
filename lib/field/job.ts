import { DEFAULT_FIELD_JOB } from "@/lib/field/constants";
import type { FieldJob, Project } from "@/lib/suite/types";

export function fieldJobFromProject(project: Project): FieldJob {
  return {
    id: project.id,
    projectId: project.id,
    companyName: DEFAULT_FIELD_JOB.companyName,
    jobTitle: project.name,
    jobNumber: project.jobNumber,
    address: project.address,
    client: "",
    superintendent: "",
  };
}
