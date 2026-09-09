import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { formatMoneyExact } from "@/lib/suite/form";
import { listCostJobs } from "@/lib/suite/store";
import { createJob, removeJob, updateJob } from "./actions";

export const metadata: Metadata = {
  title: "ContiCost",
};

function Variance({ budget, actual }: { budget: number; actual: number }) {
  const variance = budget - actual;
  const over = variance < 0;

  return (
    <span className={over ? "font-semibold text-red-800" : "font-semibold text-emerald-800"}>
      {over ? "−" : "+"}
      {formatMoneyExact(Math.abs(variance))}
    </span>
  );
}

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
        { key: "job", label: "Job", render: (row) => <span className="font-semibold">{row.job}</span> },
        { key: "budget", label: "Budget", render: (row) => formatMoneyExact(row.budget) },
        { key: "committed", label: "Committed", render: (row) => formatMoneyExact(row.committed) },
        { key: "actual", label: "Actual", render: (row) => formatMoneyExact(row.actual) },
        {
          key: "variance",
          label: "Variance",
          render: (row) => <Variance budget={row.budget} actual={row.actual} />,
        },
      ]}
      rows={rows}
      defaults={{ job: "", budget: "0", committed: "0", actual: "0" }}
      toFormValues={(row) => ({
        job: row.job,
        budget: String(row.budget),
        committed: String(row.committed),
        actual: String(row.actual),
      })}
      createAction={createJob}
      updateAction={updateJob}
      deleteAction={removeJob}
    />
  );
}
