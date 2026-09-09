"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SettingsIcon } from "@/components/field/icons";
import { PROJECT_STATUSES } from "@/lib/projects";
import { saveProjectAction } from "@/app/app/projects/actions";
import type { Project } from "@/lib/suite/types";

export function FieldProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await saveProjectAction(formData);
        setOpen(false);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save job.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-md bg-field-surface-2 text-field-ink field-shadow"
        aria-label="Project settings"
      >
        <SettingsIcon className="size-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-field-ink/30 p-4 sm:items-center">
          <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-field-surface p-5 field-shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-field-ink">
                Project settings
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-field-muted">
                Close
              </button>
            </div>
            <input type="hidden" name="id" value={project.id} />
            <div className="grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                  Job title
                </span>
                <input
                  name="name"
                  required
                  defaultValue={project.name}
                  className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                  Job number
                </span>
                <input
                  name="jobNumber"
                  defaultValue={project.jobNumber}
                  className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                  Address
                </span>
                <input
                  name="address"
                  defaultValue={project.address}
                  className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={project.status}
                  className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error ? <p className="mt-3 text-sm text-field-danger">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-4 h-11 w-full rounded-md bg-field-primary text-sm font-semibold text-field-primary-fg disabled:opacity-70"
            >
              {pending ? "Saving…" : "Save job"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
