"use server";

import { revalidatePath } from "next/cache";
import { readInt, readRequired, readString } from "@/lib/suite/form";
import { deleteFieldReport, saveFieldReport } from "@/lib/suite/store";

function readReport(formData: FormData) {
  return {
    date: readRequired(formData, "date", "Date"),
    jobName: readRequired(formData, "jobName", "Job name"),
    weather: readRequired(formData, "weather", "Weather"),
    notes: readString(formData, "notes"),
    crewCount: readInt(formData, "crewCount", "Crew count", 0, 500),
  };
}

export async function createReport(formData: FormData) {
  await saveFieldReport(readReport(formData));
  revalidatePath("/app/field");
}

export async function updateReport(id: string, formData: FormData) {
  await saveFieldReport(readReport(formData), id);
  revalidatePath("/app/field");
}

export async function removeReport(id: string) {
  await deleteFieldReport(id);
  revalidatePath("/app/field");
}
