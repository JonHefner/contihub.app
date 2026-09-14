import { createChangeOrder, removeChangeOrder, updateChangeOrder } from "@/app/app/change-orders/actions";
import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { ChangeOrderSummaryCards } from "@/components/suite/change-order-summary";
import { LoadSampleChangeOrdersButton } from "@/components/suite/load-sample-change-orders-button";
import { SuiteShell } from "@/components/suite-shell";
import {
  CHANGE_ORDER_STATUSES,
  CHANGE_ORDER_TYPES,
  nextChangeOrderNumber,
  summarizeChangeOrders,
} from "@/lib/change-orders";
import { listChangeOrders } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";

export async function ChangeOrderScreen({ project }: { project: Project }) {
  const { rows, persist } = await listChangeOrders(project.id);
  const summary = summarizeChangeOrders(rows);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="change-orders" />
      <ChangeOrderSummaryCards summary={summary} />
      <div className="mt-8">
        <CrudBoard
          eyebrow="Change Orders"
          title="Change order log"
          description={`Proposed, priced, approved, and rejected COs for ${project.name}. Amounts may be negative for deducts. Owner exposure is pending plus approved.`}
          addLabel="Add change order"
          editLabel="Edit change order"
          emptyTitle="No change orders on this project"
          emptyBody="Add a CO, or load the fictional Midwest Regional Stadium Renovation sample breakdown."
          persist={persist}
          fields={[
            { name: "number", label: "CO number", type: "text", required: true, placeholder: "CO-001" },
            { name: "title", label: "Title", type: "text", required: true, placeholder: "What changed" },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Scope, reason, or owner direction",
            },
            { name: "type", label: "Type", type: "select", required: true, options: [...CHANGE_ORDER_TYPES] },
            {
              name: "amount",
              label: "Amount",
              type: "number",
              required: true,
              step: "0.01",
              placeholder: "Negative for deducts",
            },
            { name: "status", label: "Status", type: "select", required: true, options: [...CHANGE_ORDER_STATUSES] },
            { name: "submittedDate", label: "Submitted", type: "date" },
            { name: "decidedDate", label: "Decided", type: "date" },
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Pricing notes, owner comments" },
          ]}
          columns={[
            { key: "number", label: "CO", format: "emphasis" },
            { key: "title", label: "Title", className: "min-w-48" },
            { key: "type", label: "Type", format: "badge" },
            { key: "amount", label: "Amount", format: "signed-money" },
            { key: "status", label: "Status", format: "status" },
            { key: "submittedDate", label: "Submitted", format: "date" },
            { key: "notes", label: "Notes", className: "min-w-48 text-muted" },
          ]}
          rows={rows}
          defaults={{
            number: nextChangeOrderNumber(rows),
            title: "",
            description: "",
            type: "Owner",
            amount: "0",
            status: "Proposed",
            submittedDate: "",
            decidedDate: "",
            notes: "",
            projectId: project.id,
          }}
          hiddenValues={{ projectId: project.id }}
          createAction={createChangeOrder}
          updateAction={updateChangeOrder}
          deleteAction={removeChangeOrder}
        />
      </div>
      {rows.length === 0 ? <LoadSampleChangeOrdersButton projectId={project.id} /> : null}
    </SuiteShell>
  );
}
