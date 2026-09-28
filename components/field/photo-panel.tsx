"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FieldPhoto } from "@/lib/suite/types";
import { removeFieldPhotoAction, uploadFieldPhotos } from "@/app/app/field/actions";

export function FieldPhotoPanel({
  projectId,
  reportId,
  photos,
}: {
  projectId: string;
  reportId: string | null;
  photos: FieldPhoto[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!reportId) {
    return (
      <section className="rounded-2xl bg-field-surface p-4 field-shadow">
        <h2 className="font-display text-xl font-semibold uppercase tracking-[0.04em] text-field-ink">Photos</h2>
        <p className="mt-2 text-sm text-field-muted">Save the log first, then attach up to 4 photos for the day.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-field-surface p-4 field-shadow">
      <h2 className="font-display text-xl font-semibold uppercase tracking-[0.04em] text-field-ink">Photos</h2>
      <p className="mt-1 text-sm text-field-muted">{photos.length} of 4 attached. JPEG, PNG, WEBP, or GIF, up to 5 MB each.</p>
      {photos.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <li key={photo.id} className="overflow-hidden rounded-md bg-field-surface-2">
              {photo.url ? (
                // Signed Supabase URLs are created per request.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={photo.caption || "Daily log photo"} className="aspect-video w-full object-cover" />
              ) : (
                <p className="p-3 text-sm text-field-muted">Photo saved. Preview needs the field-photos bucket.</p>
              )}
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <p className="truncate text-xs text-field-muted">{photo.caption || "No caption"}</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-field-danger"
                  onClick={() => {
                    startTransition(async () => {
                      await removeFieldPhotoAction(photo.id, photo.storagePath, projectId);
                      router.refresh();
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          data.set("projectId", projectId);
          data.set("reportId", reportId);
          setError(null);
          startTransition(async () => {
            try {
              await uploadFieldPhotos(data);
              event.currentTarget.reset();
              router.refresh();
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Could not upload photos.");
            }
          });
        }}
      >
        <input name="caption" placeholder="Caption" className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow" />
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="text-sm text-field-ink" />
        <button type="submit" disabled={pending || photos.length >= 4} className="h-11 rounded-md bg-field-primary text-sm font-semibold text-field-primary-fg disabled:opacity-70">
          {pending ? "Uploading…" : "Upload photos"}
        </button>
        {error ? <p className="text-sm text-field-danger">{error}</p> : null}
      </form>
    </section>
  );
}
