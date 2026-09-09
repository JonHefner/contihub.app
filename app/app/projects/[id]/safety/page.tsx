import type { Metadata } from "next";
import { SafetyScreen } from "@/components/suite/safety-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ContiSafety",
};

export default async function ProjectSafetyPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <SafetyScreen project={project} />;
}
