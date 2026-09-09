import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiField",
};

export default async function FieldPage() {
  const { projects, persist } = await listOrRedirectToProject("field");

  return (
    <SuiteShell>
      <ProjectPicker
        app="field"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiField daily logs are scoped per job. Open a project to file today’s report."
      />
    </SuiteShell>
  );
}
