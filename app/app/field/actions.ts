"use server";

import { readInt, readNumber, readRequired, readString } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteFieldReport, deleteFieldRfi, saveFieldReport, saveFieldRfi } from "@/lib/suite/store";
import type { FieldLogStatus, FieldRfiStatus } from "@/lib/suite/types";

function readLog(formData: FormData) {
  const manHours = readNumber(formData, "manHours", "Man-hours");
  if (manHours < 0) {
    throw new Error("Man-hours cannot be negative.");
  }

  const status: FieldLogStatus = formData.get("markFinal") ? "final" : "draft";

  return {
    projectId: readProjectId(formData) ?? "",
    date: readRequired(formData, "date", "Date"),
    jobName: readString(formData, "jobName"),
    weather: readString(formData, "weather", "Clear"),
    weatherPm: readString(formData, "weatherPm"),
    tempLow: readString(formData, "tempLow"),
    tempHigh: readString(formData, "tempHigh"),
    precip: readString(formData, "precip"),
    wind: readString(formData, "wind"),
    ground: readString(formData, "ground", "Dry"),
    notes: readString(formData, "notes"),
    crewCount: readInt(formData, "crewCount", "On-site count", 0, 500),
    manHours: Math.round(manHours * 10) / 10,
    workPerformed: readString(formData, "workPerformed"),
    delays: readString(formData, "delays"),
    materials: readString(formData, "materials"),
    visitors: readString(formData, "visitors"),
    preparedBy: readString(formData, "preparedBy"),
    preparedTitle: readString(formData, "preparedTitle"),
    shiftStart: readString(formData, "shiftStart"),
    shiftEnd: readString(formData, "shiftEnd"),
    status,
  };
}

export async function saveLog(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  const log = readLog(formData);
  await saveFieldReport(log, id);
  revalidateSuite("field", log.projectId);
}

export async function removeLog(id: string) {
  await deleteFieldReport(id);
  revalidateSuite("field");
}

export async function saveRfi(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  const statusValue = readString(formData, "status", "open");
  const status: FieldRfiStatus = statusValue === "closed" ? "closed" : "open";
  const projectId = readProjectId(formData) ?? "";
  await saveFieldRfi(
    {
      projectId,
      number: readRequired(formData, "number", "Number"),
      title: readRequired(formData, "title", "Title"),
      description: readString(formData, "description"),
      status,
      dueDate: readRequired(formData, "dueDate", "Due date"),
    },
    id,
  );
  revalidateSuite("field", projectId);
}

export async function removeRfi(id: string) {
  await deleteFieldRfi(id);
  revalidateSuite("field");
}
