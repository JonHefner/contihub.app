import Link from "next/link";
import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { projectHref } from "@/lib/projects";
import { listCostJobs } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createJob, removeJob, updateJob } from "@/app/app/cost/actions";

export async function CostScreen({ project }: { project: Project }) {
  const { rows, persist } = await listCostJobs(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="cost" />
      <Link
        href={projectHref(project.id, "change-orders")}
        className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-gold/25 bg-surface px-4 py-3 transition hover:border-gold/55"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Change orders</p>
          <p className="mt-1 text-sm text-muted">
            Open the CO log for proposed / priced / approved breakdown and net owner exposure.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Open log</span>
      </Link>
      <CrudBoard
        eyebrow="ContiCost"
        title="Job cost summary"
        description={`Budget vs. committed vs. actual for ${project.name}.`}
        addLabel="Add job"
        editLabel="Edit job cost"
        emptyTitle="No job costs on this project"
        emptyBody="Add a cost line for this job."
        persist={persist}
        fields={[
          { name: "job", label: "Job", type: "text", required: true, placeholder: "Job or cost code name" },
          { name: "budget", label: "Budget", type: "number", required: true, min: 0, step: "0.01" },
          { name: "committed", label: "Committed", type: "number", required: true, min: 0, step: "0.01" },
          { name: "actual", label: "Actual", type: "number", required: true, min: 0, step: "0.01" },
        ]}
        columns={[
          { key: "job", label: "Job", format: "emphasis" },
          { key: "budget", label: "Budget", format: "money" },
          { key: "committed", label: "Committed", format: "money" },
          { key: "actual", label: "Actual", format: "money" },
          { key: "variance", label: "Variance", format: "variance" },
        ]}
        rows={rows}
        defaults={{ job: project.name, budget: "0", committed: "0", actual: "0", projectId: project.id }}
        hiddenValues={{ projectId: project.id }}
        createAction={createJob}
        updateAction={updateJob}
        deleteAction={removeJob}
      />
    </SuiteShell>
  );
}
