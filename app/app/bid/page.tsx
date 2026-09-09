import type { Metadata } from "next";
import { ProjectPicker } from "@/components/projects/project-picker";
import { SuiteShell } from "@/components/suite-shell";
import { listOrRedirectToProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "Conti Bid",
};

export default async function BidPage() {
  const { projects, persist } = await listOrRedirectToProject("bid");

  return (
    <SuiteShell>
      <ProjectPicker
        app="bid"
        projects={projects}
        persist={persist}
        title="Choose a project"
        description="Conti Bid is scoped per job. Open a project to see only that job’s chase list."
      />
    </SuiteShell>
  );
}
