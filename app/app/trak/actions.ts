"use server";

import { readInt, readRequired } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteTrakMilestone, saveTrakMilestone } from "@/lib/suite/store";

function readMilestone(formData: FormData) {
  const start = readRequired(formData, "start", "Start");
  const finish = readRequired(formData, "finish", "Finish");

  if (finish < start) {
    throw new Error("Finish date cannot be before start date.");
  }

  return {
    projectId: readProjectId(formData) ?? "",
    activity: readRequired(formData, "activity", "Activity"),
    start,
    finish,
    percentComplete: readInt(formData, "percentComplete", "% complete", 0, 100),
  };
}

export async function createMilestone(formData: FormData) {
  const milestone = readMilestone(formData);
  await saveTrakMilestone(milestone);
  revalidateSuite("trak", milestone.projectId);
}

export async function updateMilestone(id: string, formData: FormData) {
  const milestone = readMilestone(formData);
  await saveTrakMilestone(milestone, id);
  revalidateSuite("trak", milestone.projectId);
}

export async function removeMilestone(id: string) {
  await deleteTrakMilestone(id);
  revalidateSuite("trak");
}
