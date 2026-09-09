import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { formatDate } from "@/lib/suite/form";
import { listSafetyLogs } from "@/lib/suite/store";
import { createLog, removeLog, updateLog } from "./actions";

export const metadata: Metadata = {
  title: "ContiSafety",
};

const types = ["Toolbox Talk", "Incident", "Near Miss", "Inspection"];

export default async function SafetyPage() {
  const { rows, persist } = await listSafetyLogs();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <CrudBoard
      eyebrow="ContiSafety"
      title="Safety log"
      description="Toolbox talks, incidents, near misses, and inspections — type, date, location, and notes."
      addLabel="Add safety entry"
      editLabel="Edit safety entry"
      emptyTitle="No safety entries yet"
      emptyBody="Log a toolbox talk or incident so the job has a paper trail from day one."
      persist={persist}
      fields={[
        { name: "type", label: "Type", type: "select", required: true, options: types },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "location", label: "Location", type: "text", required: true, placeholder: "Job / area" },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Topic, people present, follow-up" },
      ]}
      columns={[
        {
          key: "type",
          label: "Type",
          render: (row) => (
            <span className="rounded-sm bg-navy-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-navy-800">
              {row.type}
            </span>
          ),
        },
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "location", label: "Location", render: (row) => <span className="font-semibold">{row.location}</span> },
        { key: "notes", label: "Notes", className: "min-w-56 text-steel-600" },
      ]}
      rows={rows}
      defaults={{ type: "Toolbox Talk", date: today, location: "", notes: "" }}
      toFormValues={(row) => ({
        type: row.type,
        date: row.date,
        location: row.location,
        notes: row.notes,
      })}
      createAction={createLog}
      updateAction={updateLog}
      deleteAction={removeLog}
    />
  );
}
