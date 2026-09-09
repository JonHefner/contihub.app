import type { Metadata } from "next";
import { CrmScreen } from "@/components/suite/crm-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ContiCRM",
};

export default async function ProjectCrmPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <CrmScreen project={project} />;
}
