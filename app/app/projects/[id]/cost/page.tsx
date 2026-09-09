import type { Metadata } from "next";
import { CostScreen } from "@/components/suite/cost-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ContiCost",
};

export default async function ProjectCostPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <CostScreen project={project} />;
}
