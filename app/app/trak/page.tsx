import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiTraK",
};

export default async function TrakPage() {
  const { projects, persist } = await listOrRedirectToProject("trak");

  return (
    <SuiteShell>
      <ProjectPicker
        app="trak"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiTraK is scoped per job. Open a project to see only that job’s milestones."
      />
    </SuiteShell>
  );
}
