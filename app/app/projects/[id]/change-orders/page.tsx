import type { Metadata } from "next";
import { ChangeOrderScreen } from "@/components/suite/change-order-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Change Orders",
};

export default async function ProjectChangeOrdersPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <ChangeOrderScreen project={project} />;
}
