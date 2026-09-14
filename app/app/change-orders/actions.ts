"use server";

import {
  isChangeOrderStatus,
  isChangeOrderType,
  normalizeChangeOrderAmount,
} from "@/lib/change-orders";
import { readRequired, readSignedMoney, readString } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteChangeOrder, saveChangeOrder, seedSampleChangeOrders } from "@/lib/suite/store";

function readChangeOrder(formData: FormData) {
  const typeValue = readRequired(formData, "type", "Type");
  if (!isChangeOrderType(typeValue)) {
    throw new Error("Type is invalid.");
  }
  const statusValue = readRequired(formData, "status", "Status");
  if (!isChangeOrderStatus(statusValue)) {
    throw new Error("Status is invalid.");
  }

  return {
    projectId: readProjectId(formData) ?? "",
    number: readRequired(formData, "number", "CO number"),
    title: readRequired(formData, "title", "Title"),
    description: readString(formData, "description"),
    type: typeValue,
    amount: normalizeChangeOrderAmount(typeValue, readSignedMoney(formData, "amount", "Amount")),
    status: statusValue,
    submittedDate: readString(formData, "submittedDate"),
    decidedDate: readString(formData, "decidedDate"),
    notes: readString(formData, "notes"),
  };
}

export async function createChangeOrder(formData: FormData) {
  const changeOrder = readChangeOrder(formData);
  await saveChangeOrder(changeOrder);
  revalidateSuite("change-orders", changeOrder.projectId);
}

export async function updateChangeOrder(id: string, formData: FormData) {
  const changeOrder = readChangeOrder(formData);
  await saveChangeOrder(changeOrder, id);
  revalidateSuite("change-orders", changeOrder.projectId);
}

export async function removeChangeOrder(id: string) {
  await deleteChangeOrder(id);
  revalidateSuite("change-orders");
}

export async function loadSampleChangeOrders(projectId: string) {
  if (!projectId) {
    throw new Error("Project is required.");
  }
  await seedSampleChangeOrders(projectId);
  revalidateSuite("change-orders", projectId);
}
