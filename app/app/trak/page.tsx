import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { SuiteShell } from "@/components/suite-shell";
import { listTrakMilestones } from "@/lib/suite/store";
import { createMilestone, removeMilestone, updateMilestone } from "./actions";

export const metadata: Metadata = {
  title: "ContiTraK",
};

export default async function TrakPage() {
  const { rows, persist } = await listTrakMilestones();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <SuiteShell>
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
        { key: "activity", label: "Activity", format: "emphasis" },
        { key: "start", label: "Start", format: "date" },
        { key: "finish", label: "Finish", format: "date" },
        { key: "percentComplete", label: "% complete", format: "percent" },
      ]}
      rows={rows}
      defaults={{ activity: "", start: today, finish: today, percentComplete: "0" }}
      createAction={createMilestone}
      updateAction={updateMilestone}
      deleteAction={removeMilestone}
    />
    </SuiteShell>
  );
}
