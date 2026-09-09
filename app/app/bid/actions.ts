"use server";

import { readMoney, readRequired } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteBidChase, saveBidChase } from "@/lib/suite/store";

function readChase(formData: FormData) {
  return {
    projectId: readProjectId(formData) ?? "",
    project: readRequired(formData, "project", "Project"),
    dueDate: readRequired(formData, "dueDate", "Due date"),
    status: readRequired(formData, "status", "Status"),
    estimateValue: readMoney(formData, "estimateValue", "Estimate value"),
  };
}

export async function createChase(formData: FormData) {
  const chase = readChase(formData);
  await saveBidChase(chase);
  revalidateSuite("bid", chase.projectId);
}

export async function updateChase(id: string, formData: FormData) {
  const chase = readChase(formData);
  await saveBidChase(chase, id);
  revalidateSuite("bid", chase.projectId);
}

export async function removeChase(id: string) {
  await deleteBidChase(id);
  revalidateSuite("bid");
}
