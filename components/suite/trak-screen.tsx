import { CrudBoard } from "@/components/crud-board";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SuiteShell } from "@/components/suite-shell";
import { todayISO } from "@/lib/suite/form";
import { listTrakMilestones } from "@/lib/suite/store";
import type { Project } from "@/lib/suite/types";
import { createMilestone, removeMilestone, updateMilestone } from "@/app/app/trak/actions";

export async function TrakScreen({ project }: { project: Project }) {
  const { rows, persist } = await listTrakMilestones(project.id);

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="trak" />
      <CrudBoard
        eyebrow="ContiTraK"
        title="Schedule & milestones"
        description={`Activities and percent complete for ${project.name}.`}
        addLabel="Add milestone"
        editLabel="Edit milestone"
        emptyTitle="No milestones on this project"
        emptyBody="Add the first activity for this job."
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
        defaults={{
          activity: "",
          start: todayISO(),
          finish: todayISO(),
          percentComplete: "0",
          projectId: project.id,
        }}
        hiddenValues={{ projectId: project.id }}
        createAction={createMilestone}
        updateAction={updateMilestone}
        deleteAction={removeMilestone}
      />
    </SuiteShell>
  );
}
