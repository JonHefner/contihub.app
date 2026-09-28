import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { crmStageOptions } from "@/lib/crm/stages";
import { listCrmLeads } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createLead, removeLead, updateLead } from "@/app/app/crm/actions";

export async function CrmScreen({ project }: { project: Project }) {
  const { rows, persist } = await listCrmLeads(project.id);
  const stages = crmStageOptions(rows.map((row) => row.stage));

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="crm" />
      <CrudBoard
        eyebrow="ContiCRM"
        title="Opportunity board"
        description={`Conti chase stages for ${project.name}: Lead, Chase, Interview, Award, Method.`}
        addLabel="Add opportunity"
        editLabel="Edit opportunity"
        emptyTitle="No opportunities on this project"
        emptyBody="Add a lead for this job. Records stay scoped to the selected project."
        persist={persist}
        fields={[
          { name: "name", label: "Name", type: "text", required: true, placeholder: "Contact or opportunity" },
          { name: "company", label: "Company", type: "text", required: true, placeholder: "Owner / GC / architect" },
          { name: "stage", label: "Stage", type: "select", required: true, options: stages },
          { name: "nextAction", label: "Next action", type: "text", placeholder: "Call, site walk, send quals" },
          { name: "value", label: "Value", type: "number", min: 0, step: "0.01" },
          { name: "notes", label: "Notes", type: "textarea", placeholder: "Decision maker, context" },
        ]}
        columns={[
          { key: "name", label: "Name", format: "emphasis" },
          { key: "company", label: "Company" },
          { key: "stage", label: "Stage", format: "badge" },
          { key: "nextAction", label: "Next action" },
          { key: "value", label: "Value", format: "money" },
          { key: "notes", label: "Notes", className: "min-w-56 text-muted" },
        ]}
        rows={rows}
        defaults={{ name: "", company: "", stage: "Lead", nextAction: "", value: "0", notes: "", projectId: project.id }}
        hiddenValues={{ projectId: project.id }}
        createAction={createLead}
        updateAction={updateLead}
        deleteAction={removeLead}
      />
    </SuiteShell>
  );
}
