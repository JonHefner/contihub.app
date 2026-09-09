import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { formatDate } from "@/lib/suite/form";
import { listTrakMilestones } from "@/lib/suite/store";
import { createMilestone, removeMilestone, updateMilestone } from "./actions";

export const metadata: Metadata = {
  title: "ContiTraK",
};

export default async function TrakPage() {
  const { rows, persist } = await listTrakMilestones();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <CrudBoard
      eyebrow="ContiTraK"
      title="Schedule & milestones"
      description="Keep the job moving — activity, start, finish, and percent complete."
      addLabel="Add milestone"
      editLabel="Edit milestone"
      emptyTitle="No milestones yet"
      emptyBody="Add the first activity so the team can see start, finish, and progress."
      persist={persist}
      fields={[
        { name: "activity", label: "Activity", type: "text", required: true, placeholder: "Foundation, steel, closeout…" },
        { name: "start", label: "Start", type: "date", required: true },
        { name: "finish", label: "Finish", type: "date", required: true },
        { name: "percentComplete", label: "% complete", type: "number", required: true, min: 0, max: 100, step: "1" },
      ]}
      columns={[
        { key: "activity", label: "Activity", render: (row) => <span className="font-semibold">{row.activity}</span> },
        { key: "start", label: "Start", render: (row) => formatDate(row.start) },
        { key: "finish", label: "Finish", render: (row) => formatDate(row.finish) },
        {
          key: "percentComplete",
          label: "% complete",
          render: (row) => (
            <div className="min-w-32">
              <div className="flex items-center justify-between text-xs font-semibold text-navy-800">
                <span>{row.percentComplete}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-steel-100">
                <div
                  className="h-full bg-navy-900"
                  style={{ width: `${Math.min(100, Math.max(0, row.percentComplete))}%` }}
                />
              </div>
            </div>
          ),
        },
      ]}
      rows={rows}
      defaults={{ activity: "", start: today, finish: today, percentComplete: "0" }}
      toFormValues={(row) => ({
        activity: row.activity,
        start: row.start,
        finish: row.finish,
        percentComplete: String(row.percentComplete),
      })}
      createAction={createMilestone}
      updateAction={updateMilestone}
      deleteAction={removeMilestone}
    />
  );
}
