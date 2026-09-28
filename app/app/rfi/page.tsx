import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiReview",
};

export default async function RfiPickerPage() {
  const { projects, persist } = await listOrRedirectToProject("rfi");

  return (
    <SuiteShell>
      <ProjectPicker
        app="rfi"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiReview is scoped per job. Open a project for the ContiReview form, then route and distribute that job’s RFIs."
      />
    </SuiteShell>
  );
}
