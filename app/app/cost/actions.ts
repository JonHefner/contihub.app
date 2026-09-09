"use server";

import { readMoney, readRequired } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteCostJob, saveCostJob } from "@/lib/suite/store";

function readJob(formData: FormData) {
  return {
    projectId: readProjectId(formData) ?? "",
    job: readRequired(formData, "job", "Job"),
    budget: readMoney(formData, "budget", "Budget"),
    committed: readMoney(formData, "committed", "Committed"),
    actual: readMoney(formData, "actual", "Actual"),
  };
}

export async function createJob(formData: FormData) {
  const job = readJob(formData);
  await saveCostJob(job);
  revalidateSuite("cost", job.projectId);
}

export async function updateJob(id: string, formData: FormData) {
  const job = readJob(formData);
  await saveCostJob(job, id);
  revalidateSuite("cost", job.projectId);
}

export async function removeJob(id: string) {
  await deleteCostJob(id);
  revalidateSuite("cost");
}
