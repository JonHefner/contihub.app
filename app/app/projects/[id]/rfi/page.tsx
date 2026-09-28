import type { Metadata } from "next";
import { RfiScreen } from "@/components/rfi/rfi-screen";
import { loadProject } from "@/lib/suite/project-route";

export const metadata: Metadata = {
  title: "ContiReview",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ id?: string }>;
};

export default async function ProjectRfiPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const project = await loadProject(id);
  return <RfiScreen project={project} activeId={query.id ?? ""} />;
}
