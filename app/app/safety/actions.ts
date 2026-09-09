"use server";

import { revalidatePath } from "next/cache";
import { readRequired, readString } from "@/lib/suite/form";
import { deleteSafetyLog, saveSafetyLog } from "@/lib/suite/store";

function readLog(formData: FormData) {
  return {
    type: readRequired(formData, "type", "Type"),
    date: readRequired(formData, "date", "Date"),
    location: readRequired(formData, "location", "Location"),
    notes: readString(formData, "notes"),
  };
}

export async function createLog(formData: FormData) {
  await saveSafetyLog(readLog(formData));
  revalidatePath("/app/safety");
}

export async function updateLog(id: string, formData: FormData) {
  await saveSafetyLog(readLog(formData), id);
  revalidatePath("/app/safety");
}

export async function removeLog(id: string) {
  await deleteSafetyLog(id);
  revalidatePath("/app/safety");
}
