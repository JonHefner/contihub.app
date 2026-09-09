import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { listCrmLeads } from "@/lib/suite/store";
import { createLead, removeLead, updateLead } from "./actions";

export const metadata: Metadata = {
  title: "ContiCRM",
};

const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Awarded", "Lost"];

export default async function CrmPage() {
  const { rows, persist } = await listCrmLeads();

  return (
    <CrudBoard
      eyebrow="ContiCRM"
      title="Opportunity board"
      description="Track owners, architects, and chase work. MVP list — name, company, stage, and notes."
      addLabel="Add opportunity"
      editLabel="Edit opportunity"
      emptyTitle="No opportunities yet"
      emptyBody="Add a lead to start the chase. Records persist in Supabase after the suite migration is applied."
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
        { key: "notes", label: "Notes", className: "min-w-56 text-steel-600" },
      ]}
      rows={rows}
      defaults={{ name: "", company: "", stage: "Lead", notes: "" }}
      createAction={createLead}
      updateAction={updateLead}
      deleteAction={removeLead}
    />
  );
}
