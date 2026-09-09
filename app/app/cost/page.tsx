import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiCost",
};

export default async function CostPage() {
  const { projects, persist } = await listOrRedirectToProject("cost");

  return (
    <SuiteShell>
      <ProjectPicker
        app="cost"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiCost is scoped per job. Open a project to see only that job’s costs."
      />
    </SuiteShell>
  );
}
