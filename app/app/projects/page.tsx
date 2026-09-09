import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/projects/project-form";
import { SuiteShell } from "@/components/suite-shell";
import { SUITE_APP_KEYS, projectHref } from "@/lib/projects";
import { listProjects } from "@/lib/suite/store";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const { rows, persist } = await listProjects();

  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">ContiHub</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
        Projects
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Every Conti job lives here. Open a project to work Field, CRM, Cost, Safety, TraK, and Bid
        against that job only.
      </p>
      {persist === "memory" ? (
        <p className="mt-5 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Using an in-session store until Jon applies{" "}
          <code className="font-mono text-xs">supabase/migrations/20260909180000_projects.sql</code>{" "}
          in the Supabase SQL editor (after the suite and ContiField migrations).
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-line bg-surface px-6 py-10 text-center">
          <p className="font-display text-2xl text-ink-strong">No projects yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Create the first job. Existing sample “Data Center” rows attach automatically after the
            Projects SQL is applied.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {rows.map((project) => (
            <li key={project.id}>
              <article className="h-full rounded-2xl border border-gold/25 bg-charcoal p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink-strong">
                      {project.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {project.jobNumber ? `Job ${project.jobNumber}` : "No job #"}
                      {project.address ? ` · ${project.address}` : ""}
                    </p>
                  </div>
                  <span className="rounded-sm bg-royal-deep px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-soft">
                    {project.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={projectHref(project.id)}
                    className="rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-page"
                  >
                    Open project
                  </Link>
                  {SUITE_APP_KEYS.map((app) => (
                    <Link
                      key={app}
                      href={projectHref(project.id, app)}
                      className="rounded-sm border border-gold/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold"
                    >
                      {app}
                    </Link>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 font-display text-2xl font-semibold text-ink-strong">New project</h2>
      <p className="mt-2 mb-5 text-sm text-muted">Name, job number, address, and status.</p>
      <ProjectForm />
    </SuiteShell>
  );
}
