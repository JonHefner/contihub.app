import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { listCostJobs } from "@/lib/suite/store";
import { createJob, removeJob, updateJob } from "./actions";

export const metadata: Metadata = {
  title: "ContiCost",
};

export default async function CostPage() {
  const { rows, persist } = await listCostJobs();

  return (
    <CrudBoard
      eyebrow="ContiCost"
      title="Job cost summary"
      description="Simple budget vs. committed vs. actual. Variance is budget minus actual — not a full ERP cost engine."
      addLabel="Add job"
      editLabel="Edit job cost"
      emptyTitle="No job costs yet"
      emptyBody="Add a job to watch budget, commitments, and actuals in one table."
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
      defaults={{ job: "", budget: "0", committed: "0", actual: "0" }}
      createAction={createJob}
      updateAction={updateJob}
      deleteAction={removeJob}
    />
  );
}
