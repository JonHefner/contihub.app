import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { listCrmLeads } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createLead, removeLead, updateLead } from "@/app/app/crm/actions";

const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Awarded", "Lost"];

export async function CrmScreen({ project }: { project: Project }) {
  const { rows, persist } = await listCrmLeads(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="crm" />
      <CrudBoard
        eyebrow="ContiCRM"
        title="Opportunity board"
        description={`Leads and chase work for ${project.name} only.`}
        addLabel="Add opportunity"
        editLabel="Edit opportunity"
        emptyTitle="No opportunities on this project"
        emptyBody="Add a lead for this job. Records stay scoped to the selected project."
        persist={persist}
        fields={[
          { name: "name", label: "Name", type: "text", required: true, placeholder: "Contact or opportunity" },
          { name: "company", label: "Company", type: "text", required: true, placeholder: "Owner / GC / architect" },
          { name: "stage", label: "Stage", type: "select", required: true, options: stages },
          { name: "notes", label: "Notes", type: "textarea", placeholder: "Next step, decision maker, context" },
        ]}
        columns={[
          { key: "name", label: "Name", format: "emphasis" },
          { key: "company", label: "Company" },
          { key: "stage", label: "Stage", format: "badge" },
          { key: "notes", label: "Notes", className: "min-w-56 text-muted" },
        ]}
        rows={rows}
        defaults={{ name: "", company: "", stage: "Lead", notes: "", projectId: project.id }}
        hiddenValues={{ projectId: project.id }}
        createAction={createLead}
        updateAction={updateLead}
        deleteAction={removeLead}
      />
    </SuiteShell>
  );
}
