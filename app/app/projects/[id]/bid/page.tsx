import type { Metadata } from "next";
import { BidScreen } from "@/components/suite/bid-screen";
import { loadProject } from "@/lib/suite/project-route";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Conti Bid",
};

export default async function ProjectBidPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  return <BidScreen project={project} />;
}
