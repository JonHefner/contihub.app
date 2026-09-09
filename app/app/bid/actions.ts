"use server";

import { revalidatePath } from "next/cache";
import { readMoney, readRequired } from "@/lib/suite/form";
import { deleteBidChase, saveBidChase } from "@/lib/suite/store";

function readChase(formData: FormData) {
  return {
    project: readRequired(formData, "project", "Project"),
    dueDate: readRequired(formData, "dueDate", "Due date"),
    status: readRequired(formData, "status", "Status"),
    estimateValue: readMoney(formData, "estimateValue", "Estimate value"),
  };
}

export async function createChase(formData: FormData) {
  await saveBidChase(readChase(formData));
  revalidatePath("/app/bid");
}

export async function updateChase(id: string, formData: FormData) {
  await saveBidChase(readChase(formData), id);
  revalidatePath("/app/bid");
}

export async function removeChase(id: string) {
  await deleteBidChase(id);
  revalidatePath("/app/bid");
}
