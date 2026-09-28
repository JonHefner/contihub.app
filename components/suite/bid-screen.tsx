import { PackageBoard } from "@/components/bid/package-board";
import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { todayISO } from "@/lib/suite/form";
import { listContractors, listInvitees, listPackages } from "@/lib/suite/bid-store";
import { listBidChases } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createChase, removeChase, updateChase } from "@/app/app/bid/actions";

const statuses = ["Tracking", "In Progress", "Submitted", "Awarded", "Lost", "No Bid"];

export async function BidScreen({ project }: { project: Project }) {
  const [chases, packages, invitees, contractors] = await Promise.all([
    listBidChases(project.id),
    listPackages(project.id),
    listInvitees(),
    listContractors(),
  ]);
  const packageIds = new Set(packages.rows.map((row) => row.id));

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="bid" />
      <PackageBoard
        projectId={project.id}
        projectName={project.name}
        packages={packages.rows}
        invitees={invitees.rows.filter((row) => packageIds.has(row.packageId))}
        contractors={contractors.rows}
        persist={packages.persist}
      />
      <CrudBoard
        eyebrow="Conti Bid"
        title="Bid chase list"
        description={`Chase status for ${project.name}. Packages and magic-link invites are above. Takeoff stays outside Hub.`}
        addLabel="Add bid"
        editLabel="Edit bid"
        emptyTitle="No bids on this project"
        emptyBody="Add a chase record for this job."
        persist={chases.persist}
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
        rows={chases.rows}
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
