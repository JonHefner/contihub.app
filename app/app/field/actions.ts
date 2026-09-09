"use server";

import { revalidatePath } from "next/cache";
import { readInt, readNumber, readRequired, readString } from "@/lib/suite/form";
import {
  deleteFieldReport,
  deleteFieldRfi,
  saveFieldJob,
  saveFieldReport,
  saveFieldRfi,
} from "@/lib/suite/store";
import type { FieldLogStatus, FieldRfiStatus } from "@/lib/suite/types";

function revalidateField(date?: string) {
  revalidatePath("/app/field");
  revalidatePath("/app/field/rfis");
  if (date) {
    revalidatePath(`/app/field/log/${date}`);
  }
}

function readLog(formData: FormData) {
  const manHours = readNumber(formData, "manHours", "Man-hours");
  if (manHours < 0) {
    throw new Error("Man-hours cannot be negative.");
  }

  const status: FieldLogStatus = formData.get("markFinal") ? "final" : "draft";

  return {
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

export async function saveJob(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  await saveFieldJob(
    {
      companyName: readString(formData, "companyName", "Continental Construction of Ohio"),
      jobTitle: readString(formData, "jobTitle"),
      jobNumber: readString(formData, "jobNumber"),
      address: readString(formData, "address"),
      client: readString(formData, "client"),
      superintendent: readString(formData, "superintendent"),
    },
    id,
  );
  revalidateField();
}

export async function saveLog(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  const log = readLog(formData);
  await saveFieldReport(log, id);
  revalidateField(log.date);
}

export async function removeLog(id: string) {
  await deleteFieldReport(id);
  revalidateField();
}

export async function saveRfi(formData: FormData) {
  const id = readString(formData, "id") || undefined;
  const statusValue = readString(formData, "status", "open");
  const status: FieldRfiStatus = statusValue === "closed" ? "closed" : "open";
  await saveFieldRfi(
    {
      number: readRequired(formData, "number", "Number"),
      title: readRequired(formData, "title", "Title"),
      description: readString(formData, "description"),
      status,
      dueDate: readRequired(formData, "dueDate", "Due date"),
    },
    id,
  );
  revalidatePath("/app/field");
  revalidatePath("/app/field/rfis");
}

export async function removeRfi(id: string) {
  await deleteFieldRfi(id);
  revalidatePath("/app/field");
  revalidatePath("/app/field/rfis");
}
