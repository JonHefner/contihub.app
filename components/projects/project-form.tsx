"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PROJECT_STATUSES } from "@/lib/projects";
import { saveProjectAction } from "@/app/app/projects/actions";
import type { Project } from "@/lib/suite/types";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none ring-gold/25 transition focus:border-gold focus:ring-4";

export function ProjectForm({
  project,
  onDone,
}: {
  project?: Project;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const saved = await saveProjectAction(formData);
        onDone?.();
        router.push(`/app/projects/${saved.id}`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save project.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-surface p-5">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">Project name</span>
          <input
            name="name"
            required
            defaultValue={project?.name ?? ""}
            placeholder="Data Center"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Job number</span>
          <input
            name="jobNumber"
            defaultValue={project?.jobNumber ?? ""}
            placeholder="24-118"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue={project?.status ?? "Active"} className={inputClass}>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-ink">Address</span>
          <input
            name="address"
            defaultValue={project?.address ?? ""}
            placeholder="Jobsite address"
            className={inputClass}
          />
        </label>
      </div>
      {error ? (
        <p className="mt-4 rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-page disabled:opacity-70"
        >
          {pending ? "Saving…" : project ? "Save project" : "Create project"}
        </button>
      </div>
    </form>
  );
}
