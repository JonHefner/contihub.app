import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { formatDate } from "@/lib/suite/form";
import { listFieldReports } from "@/lib/suite/store";
import { createReport, removeReport, updateReport } from "./actions";

export const metadata: Metadata = {
  title: "ContiField",
};

const weather = ["Clear", "Overcast", "Rain", "Snow", "Wind", "Mixed"];

export default async function FieldPage() {
  const { rows, persist } = await listFieldReports();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <CrudBoard
      eyebrow="ContiField"
      title="Daily reports"
      description="Log the day on each job — date, job name, weather, crew count, and notes."
      addLabel="New daily report"
      editLabel="Edit daily report"
      emptyTitle="No field reports yet"
      emptyBody="Create the first daily report for a job. Photos and richer coordination can layer on later."
      persist={persist}
      fields={[
        { name: "date", label: "Date", type: "date", required: true },
        { name: "jobName", label: "Job name", type: "text", required: true, placeholder: "Project or site" },
        { name: "weather", label: "Weather", type: "select", required: true, options: weather },
        { name: "crewCount", label: "Crew count", type: "number", required: true, min: 0, max: 500, step: "1" },
        { name: "notes", label: "Notes", type: "textarea", placeholder: "Work completed, delays, visitors" },
      ]}
      columns={[
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "jobName", label: "Job", render: (row) => <span className="font-semibold">{row.jobName}</span> },
        { key: "weather", label: "Weather" },
        { key: "crewCount", label: "Crew" },
        { key: "notes", label: "Notes", className: "min-w-56 text-steel-600" },
      ]}
      rows={rows}
      defaults={{ date: today, jobName: "", weather: "Clear", notes: "", crewCount: "0" }}
      toFormValues={(row) => ({
        date: row.date,
        jobName: row.jobName,
        weather: row.weather,
        notes: row.notes,
        crewCount: String(row.crewCount),
      })}
      createAction={createReport}
      updateAction={updateReport}
      deleteAction={removeReport}
    />
  );
}
