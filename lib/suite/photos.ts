import { isMissingRelation } from "@/lib/suite/db-error";
import { requireUser } from "@/lib/suite/auth";
import type { FieldPhoto, ListResult } from "@/lib/suite/types";

type DbRow = Record<string, unknown>;

const memory = new Map<string, FieldPhoto[]>();

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function mapPhoto(row: DbRow, url = ""): FieldPhoto {
  return {
    id: asString(row.id),
    projectId: asString(row.project_id),
    reportId: asString(row.report_id),
    storagePath: asString(row.storage_path),
    caption: asString(row.caption),
    url,
  };
}

export async function listFieldPhotos(reportId: string): Promise<ListResult<FieldPhoto>> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("field_report_photos")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) {
    if (!isMissingRelation(error)) {
      throw new Error(error.message);
    }
    const rows = (memory.get(user.id) ?? []).filter((photo) => photo.reportId === reportId);
    return { persist: "memory", rows };
  }

  const rows: FieldPhoto[] = [];
  for (const row of data ?? []) {
    const photo = mapPhoto(row);
    const signed = await supabase.storage.from("field-photos").createSignedUrl(photo.storagePath, 60 * 60);
    rows.push({ ...photo, url: signed.data?.signedUrl ?? "" });
  }
  return { persist: "supabase", rows };
}

export async function countFieldPhotos(reportId: string) {
  const listed = await listFieldPhotos(reportId);
  return listed;
}

export async function insertFieldPhoto(input: Omit<FieldPhoto, "id" | "url">) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("field_report_photos")
    .insert({
      user_id: user.id,
      project_id: input.projectId,
      report_id: input.reportId,
      storage_path: input.storagePath,
      caption: input.caption,
    })
    .select("*")
    .single();

  if (!error && data) {
    return { row: mapPhoto(data), persist: "supabase" as const };
  }

  if (error && !isMissingRelation(error)) {
    throw new Error(error.message);
  }

  const created: FieldPhoto = { ...input, id: crypto.randomUUID(), url: "" };
  const rows = memory.get(user.id) ?? [];
  rows.push(created);
  memory.set(user.id, rows);
  return { row: created, persist: "memory" as const };
}

export async function removeFieldPhoto(id: string, storagePath: string) {
  const { supabase, user } = await requireUser();
  if (storagePath) {
    await supabase.storage.from("field-photos").remove([storagePath]);
  }
  const { error } = await supabase.from("field_report_photos").delete().eq("id", id);
  if (!error) {
    return;
  }
  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }
  const rows = (memory.get(user.id) ?? []).filter((photo) => photo.id !== id);
  memory.set(user.id, rows);
}

export const FIELD_PHOTO_LIMIT = 4;
export const FIELD_PHOTO_BUCKET = "field-photos";
