import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { listCostJobs } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createJob, removeJob, updateJob } from "@/app/app/cost/actions";

export async function CostScreen({ project }: { project: Project }) {
  const { rows, persist } = await listCostJobs(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="cost" />
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
