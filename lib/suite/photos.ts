import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingRelation } from "@/lib/suite/db-error";
import { requireUser } from "@/lib/suite/auth";
import type { FieldPhoto, ListResult } from "@/lib/suite/types";

type DbRow = Record<string, unknown>;

const memory = new Map<string, FieldPhoto[]>();

export const FIELD_PHOTO_LIMIT = 4;
export const FIELD_PHOTO_BUCKET = "field-photos";
const PHOTO_COLUMNS = "id, project_id, report_id, storage_path, caption, created_at";

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

async function signedPhotoUrls(supabase: SupabaseClient, paths: string[]) {
  const unique = [...new Set(paths.filter((path) => path.length > 0))];
  const urls = new Map<string, string>();
  if (unique.length === 0) {
    return urls;
  }

  const signed = await supabase.storage.from(FIELD_PHOTO_BUCKET).createSignedUrls(unique, 60 * 60);
  if (!signed.error) {
    for (const item of signed.data ?? []) {
      if (item.path && item.signedUrl && !item.error) {
        urls.set(item.path, item.signedUrl);
      }
    }
  }

  const missing = unique.filter((path) => !urls.has(path));
  await Promise.all(
    missing.map(async (path) => {
      const single = await supabase.storage.from(FIELD_PHOTO_BUCKET).createSignedUrl(path, 60 * 60);
      if (single.data?.signedUrl) {
        urls.set(path, single.data.signedUrl);
      }
    }),
  );
  return urls;
}

export async function listFieldPhotos(reportId: string): Promise<ListResult<FieldPhoto>> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("field_report_photos")
    .select(PHOTO_COLUMNS)
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) {
    if (!isMissingRelation(error)) {
      throw new Error(error.message);
    }
    const rows = (memory.get(user.id) ?? []).filter((photo) => photo.reportId === reportId);
    return { persist: "memory", rows };
  }

  const photos = (data ?? []).map((row) => mapPhoto(row));
  const urls = await signedPhotoUrls(supabase, photos.map((photo) => photo.storagePath));
  return {
    persist: "supabase",
    rows: photos.map((photo) => ({ ...photo, url: urls.get(photo.storagePath) ?? "" })),
  };
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
