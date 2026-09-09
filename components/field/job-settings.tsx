"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SettingsIcon } from "@/components/field/icons";
import { saveJob } from "@/app/app/field/actions";
import type { FieldJob } from "@/lib/suite/types";

const fields = [
  { name: "companyName", label: "Company", placeholder: "Continental Construction of Ohio" },
  { name: "jobTitle", label: "Job title", placeholder: "Project name" },
  { name: "jobNumber", label: "Job number", placeholder: "24-118" },
  { name: "address", label: "Address", placeholder: "Jobsite address" },
  { name: "client", label: "Client", placeholder: "Owner / client" },
  { name: "superintendent", label: "Superintendent", placeholder: "Name" },
] as const;

export function JobSettings({ job }: { job: FieldJob }) {
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
        await saveJob(formData);
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
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl bg-field-surface p-5 field-shadow"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-field-ink">
                Project settings
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-field-muted"
              >
                Close
              </button>
            </div>
            <input type="hidden" name="id" value={job.id} />
            <div className="grid gap-3">
              {fields.map((field) => (
                <label key={field.name} className="grid gap-1.5">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                    {field.label}
                  </span>
                  <input
                    name={field.name}
                    defaultValue={job[field.name]}
                    placeholder={field.placeholder}
                    className="h-11 rounded-md bg-field-surface-2 px-3 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
                  />
                </label>
              ))}
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
