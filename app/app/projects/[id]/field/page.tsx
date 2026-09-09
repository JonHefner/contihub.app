import type { Metadata } from "next";
import { FieldHome } from "@/components/field/field-home";
import { loadProject } from "@/lib/suite/project-route";
import { listProjects } from "@/lib/suite/store";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ContiField",
};

export default async function ProjectFieldPage({ params }: PageProps) {
  const { id } = await params;
  const [project, projects] = await Promise.all([loadProject(id), listProjects()]);
  return <FieldHome project={project} persist={projects.persist} />;
}
