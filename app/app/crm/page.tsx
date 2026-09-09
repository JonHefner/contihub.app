import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiCRM",
};

export default async function CrmPage() {
  const { projects, persist } = await listOrRedirectToProject("crm");

  return (
    <SuiteShell>
      <ProjectPicker
        app="crm"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="ContiCRM is scoped per job. Open a project to see only that job’s opportunities."
      />
    </SuiteShell>
  );
}
