import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiSafety",
};

export default async function SafetyPage() {
  const { projects, persist } = await listOrRedirectToProject("safety");

  return (
    <SuiteShell>
      <ProjectPicker
        app="safety"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiSafety is scoped per job. Open a project to see only that job’s safety log."
      />
    </SuiteShell>
  );
}
