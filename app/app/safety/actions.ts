"use server";

import { readRequired, readString } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteSafetyLog, saveSafetyLog } from "@/lib/suite/store";

function readLog(formData: FormData) {
  return {
    projectId: readProjectId(formData) ?? "",
    type: readRequired(formData, "type", "Type"),
    date: readRequired(formData, "date", "Date"),
    location: readRequired(formData, "location", "Location"),
    notes: readString(formData, "notes"),
  };
}

export async function createLog(formData: FormData) {
  const log = readLog(formData);
  await saveSafetyLog(log);
  revalidateSuite("safety", log.projectId);
}

export async function updateLog(id: string, formData: FormData) {
  const log = readLog(formData);
  await saveSafetyLog(log, id);
  revalidateSuite("safety", log.projectId);
}

export async function removeLog(id: string) {
  await deleteSafetyLog(id);
  revalidateSuite("safety");
}
