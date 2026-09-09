"use server";

import { revalidatePath } from "next/cache";
import { readInt, readRequired } from "@/lib/suite/form";
import { deleteTrakMilestone, saveTrakMilestone } from "@/lib/suite/store";

function readMilestone(formData: FormData) {
  const start = readRequired(formData, "start", "Start");
  const finish = readRequired(formData, "finish", "Finish");

  if (finish < start) {
    throw new Error("Finish date cannot be before start date.");
  }

  return {
    activity: readRequired(formData, "activity", "Activity"),
    start,
    finish,
    percentComplete: readInt(formData, "percentComplete", "% complete", 0, 100),
  };
}

export async function createMilestone(formData: FormData) {
  await saveTrakMilestone(readMilestone(formData));
  revalidatePath("/app/trak");
}

export async function updateMilestone(id: string, formData: FormData) {
  await saveTrakMilestone(readMilestone(formData), id);
  revalidatePath("/app/trak");
}

export async function removeMilestone(id: string) {
  await deleteTrakMilestone(id);
  revalidatePath("/app/trak");
}
