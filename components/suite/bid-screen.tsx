import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { todayISO } from "@/lib/suite/form";
import { listBidChases } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createChase, removeChase, updateChase } from "@/app/app/bid/actions";

const statuses = ["Tracking", "In Progress", "Submitted", "Awarded", "Lost", "No Bid"];

export async function BidScreen({ project }: { project: Project }) {
  const { rows, persist } = await listBidChases(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="bid" />
      <CrudBoard
        eyebrow="Conti Bid"
        title="Bid chase list"
        description={`Invitations through award for ${project.name}.`}
        addLabel="Add bid"
        editLabel="Edit bid"
        emptyTitle="No bids on this project"
        emptyBody="Add a chase record for this job."
        persist={persist}
        fields={[
          { name: "project", label: "Project", type: "text", required: true, placeholder: "Bid name or owner" },
          { name: "dueDate", label: "Due date", type: "date", required: true },
          { name: "status", label: "Status", type: "select", required: true, options: statuses },
          { name: "estimateValue", label: "Estimate value", type: "number", required: true, min: 0, step: "0.01" },
        ]}
        columns={[
          { key: "project", label: "Project", format: "emphasis" },
          { key: "dueDate", label: "Due date", format: "date" },
          { key: "status", label: "Status", format: "badge" },
          { key: "estimateValue", label: "Estimate", format: "money" },
        ]}
        rows={rows}
        defaults={{
          project: project.name,
          dueDate: todayISO(),
          status: "Tracking",
          estimateValue: "0",
          projectId: project.id,
        }}
        hiddenValues={{ projectId: project.id }}
        createAction={createChase}
        updateAction={updateChase}
        deleteAction={removeChase}
      />
    </SuiteShell>
  );
}
