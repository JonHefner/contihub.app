import Link from "next/link";
import { SUITE_APP_LABELS, projectHref, type SuiteAppKey } from "@/lib/projects";
import type { PersistMode, Project } from "@/lib/suite/types";

export function ProjectPicker({
  app,
  projects,
  persist,
  title,
  description,
}: {
  app: SuiteAppKey;
  projects: Project[];
  persist: PersistMode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{SUITE_APP_LABELS[app]}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      {persist === "memory" ? (
        <p className="mt-5 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Using an in-session store until Jon applies{" "}
          <code className="font-mono text-xs">supabase/migrations/20260909180000_projects.sql</code>.
        </p>
      ) : null}
      {projects.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink-strong">No projects yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Create a project first. Suite boards stay scoped to one job so Data Center and the next
            chase are not mixed.
          </p>
          <Link
            href="/app/projects"
            className="mt-6 inline-flex rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-page"
          >
            Open Projects
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={projectHref(project.id, app)}
                className="block rounded-2xl border border-gold/25 bg-surface px-5 py-4 transition hover:border-gold/55"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-ink-strong">{project.name}</h2>
                  <span className="rounded-sm bg-royal-deep px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-soft">
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {project.jobNumber ? `Job ${project.jobNumber}` : "No job #"}
                  {project.address ? ` · ${project.address}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
