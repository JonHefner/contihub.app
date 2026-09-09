import Link from "next/link";
import { ProjectSwitcher } from "@/components/projects/project-switcher";
import { SUITE_APP_LABELS, projectHref, type SuiteAppKey } from "@/lib/projects";
import { listProjects } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";

export async function ProjectScopeBar({ project, app }: { project: Project; app: SuiteAppKey }) {
  const { rows } = await listProjects();

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gold/25 bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Project</p>
        <p className="mt-1 font-semibold text-ink-strong">{project.name}</p>
        <p className="text-sm text-muted">
          {project.jobNumber ? `Job ${project.jobNumber}` : "No job #"}
          {project.address ? ` · ${project.address}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ProjectSwitcher project={project} app={app} projects={rows} />
        <Link
          href={projectHref(project.id)}
          className="rounded-sm border border-gold/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold"
        >
          Project home
        </Link>
        <Link
          href="/app/projects"
          className="rounded-sm border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted"
        >
          All projects
        </Link>
        <span className="rounded-sm bg-royal px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          {SUITE_APP_LABELS[app]}
        </span>
      </div>
    </div>
  );
}
