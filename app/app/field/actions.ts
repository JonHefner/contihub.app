"use server";

import { readInt, readNumber, readRequired, readString } from "@/lib/suite/form";
import { requireUser } from "@/lib/suite/auth";
import { FIELD_PHOTO_BUCKET, FIELD_PHOTO_LIMIT, insertFieldPhoto, listFieldPhotos, removeFieldPhoto } from "@/lib/suite/photos";
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

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadFieldPhotos(formData: FormData) {
  const projectId = readRequired(formData, "projectId", "Project");
  const reportId = readRequired(formData, "reportId", "Daily log");
  const caption = readString(formData, "caption");
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) {
    throw new Error("Choose at least one photo.");
  }

  const existing = await listFieldPhotos(reportId);
  if (existing.rows.length + files.length > FIELD_PHOTO_LIMIT) {
    throw new Error("A daily log can hold 4 photos.");
  }

  const { supabase } = await requireUser();
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Each photo must be 5 MB or smaller.");
    }
    if (!PHOTO_TYPES.has(file.type)) {
      throw new Error("Use a JPEG, PNG, WEBP, or GIF.");
    }
    const safeName = file.name.replace(/[^\w.]+/g, "_").slice(0, 80);
    const path = `${projectId}/${reportId}/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from(FIELD_PHOTO_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upload.error) {
      const missing = /bucket not found|does not exist/i.test(upload.error.message);
      throw new Error(
        missing
          ? "Apply supabase/migrations/20260927120000_full_court_press.sql so the field-photos bucket exists."
          : upload.error.message,
      );
    }
    await insertFieldPhoto({ projectId, reportId, storagePath: path, caption });
  }

  revalidateSuite("field", projectId);
}

export async function removeFieldPhotoAction(id: string, storagePath: string, projectId: string) {
  await removeFieldPhoto(id, storagePath);
  revalidateSuite("field", projectId);
}
