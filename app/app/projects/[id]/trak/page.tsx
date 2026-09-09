import type { Metadata } from "next";
import { TrakScreen } from "@/components/suite/trak-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ContiTraK",
};

export default async function ProjectTrakPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <TrakScreen project={project} />;
}
