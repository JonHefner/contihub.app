"use server";

import { readString } from "@/lib/suite/form";
import { revalidatePath } from "next/cache";
import { projectHref } from "@/lib/projects";
import { issuePackageInvites } from "@/lib/bid/send";
import { deletePackage, savePackage } from "@/lib/suite/bid-store";
import { requireStaff } from "@/lib/suite/org";

export async function createBidPackage(formData: FormData) {
  await requireStaff();
  const projectId = readString(formData, "projectId");
  const title = readString(formData, "title");
  if (!projectId || !title) {
    throw new Error("Title and project are required.");
  }
  const dueAt = readString(formData, "dueAt");
  await savePackage({
    projectId,
    projectName: readString(formData, "projectName"),
    title,
    dueAt: dueAt.length === 16 ? `${dueAt}:00` : dueAt,
    drawingsTeamsUrl: readString(formData, "drawingsTeamsUrl"),
    notes: readString(formData, "notes"),
    buildingConnectedSent: formData.get("buildingConnectedSent") === "on",
  });
  revalidatePath(projectHref(projectId, "bid"));
  revalidatePath("/app");
}

export async function removeBidPackage(id: string, projectId: string) {
  await requireStaff();
  await deletePackage(id);
  revalidatePath(projectHref(projectId, "bid"));
}

export async function sendBidInvites(formData: FormData) {
  await requireStaff();
  const packageId = readString(formData, "packageId");
  const trade = readString(formData, "trade");
  const contractorIds = formData.getAll("contractorId").map((value) => String(value)).filter(Boolean);
  if (!packageId || !trade) {
    throw new Error("Choose a package and a trade.");
  }
  const result = await issuePackageInvites({
    packageId,
    contractorIds,
    trade,
    buildingConnectedSent: formData.get("buildingConnectedSent") === "on",
  });
  revalidatePath("/app/bid");
  revalidatePath("/app");
  return result;
}
