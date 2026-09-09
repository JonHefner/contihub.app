"use client";

import { useRouter } from "next/navigation";
import { projectHref, type SuiteAppKey } from "@/lib/projects";
import type { Project } from "@/lib/suite/types";

export function ProjectSwitcher({
  project,
  app,
  projects,
}: {
  project: Project;
  app: SuiteAppKey;
  projects: Project[];
}) {
  const router = useRouter();

  if (projects.length < 2) {
    return null;
  }

  return (
    <label className="block">
      <span className="sr-only">Switch project</span>
      <select
        value={project.id}
        onChange={(event) => {
          router.push(projectHref(event.target.value, app));
        }}
        className="rounded-sm border border-gold/30 bg-charcoal px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold outline-none ring-gold/25 focus:border-gold focus:ring-4"
      >
        {projects.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
