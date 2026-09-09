import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { todayISO } from "@/lib/suite/form";
import { listSafetyLogs } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createLog, removeLog, updateLog } from "@/app/app/safety/actions";

const types = ["Toolbox Talk", "Incident", "Near Miss", "Inspection"];

export async function SafetyScreen({ project }: { project: Project }) {
  const { rows, persist } = await listSafetyLogs(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="safety" />
      <CrudBoard
        eyebrow="ContiSafety"
        title="Safety log"
        description={`Toolbox talks, incidents, and inspections for ${project.name}.`}
        addLabel="Add safety entry"
        editLabel="Edit safety entry"
        emptyTitle="No safety entries on this project"
        emptyBody="Log a toolbox talk or incident for this job."
        persist={persist}
        fields={[
          { name: "type", label: "Type", type: "select", required: true, options: types },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "location", label: "Location", type: "text", required: true, placeholder: "Job / area" },
          { name: "notes", label: "Notes", type: "textarea", placeholder: "Topic, people present, follow-up" },
        ]}
        columns={[
          { key: "type", label: "Type", format: "badge" },
          { key: "date", label: "Date", format: "date" },
          { key: "location", label: "Location", format: "emphasis" },
          { key: "notes", label: "Notes", className: "min-w-56 text-muted" },
        ]}
        rows={rows}
        defaults={{
          type: "Toolbox Talk",
          date: todayISO(),
          location: project.name,
          notes: "",
          projectId: project.id,
        }}
        hiddenValues={{ projectId: project.id }}
        createAction={createLog}
        updateAction={updateLog}
        deleteAction={removeLog}
      />
    </SuiteShell>
  );
}
