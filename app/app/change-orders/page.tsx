import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "Change Orders",
};

export default async function ChangeOrdersPage() {
  const { projects, persist } = await listOrRedirectToProject("change-orders");

  return (
    <SuiteShell>
      <ProjectPicker
        app="change-orders"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="Change orders stay scoped per job. Open a project to see that job’s CO breakdown and owner exposure."
      />
    </SuiteShell>
  );
}
