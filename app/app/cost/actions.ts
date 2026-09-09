"use server";

import { revalidatePath } from "next/cache";
import { readMoney, readRequired } from "@/lib/suite/form";
import { deleteCostJob, saveCostJob } from "@/lib/suite/store";

function readJob(formData: FormData) {
  return {
    job: readRequired(formData, "job", "Job"),
    budget: readMoney(formData, "budget", "Budget"),
    committed: readMoney(formData, "committed", "Committed"),
    actual: readMoney(formData, "actual", "Actual"),
  };
}

export async function createJob(formData: FormData) {
  await saveCostJob(readJob(formData));
  revalidatePath("/app/cost");
}

export async function updateJob(id: string, formData: FormData) {
  await saveCostJob(readJob(formData), id);
  revalidatePath("/app/cost");
}

export async function removeJob(id: string) {
  await deleteCostJob(id);
  revalidatePath("/app/cost");
}
