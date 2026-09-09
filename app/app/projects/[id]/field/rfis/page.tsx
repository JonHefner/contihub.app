import type { Metadata } from "next";
import { FieldPersistBanner } from "@/components/field/persist-banner";
import { RfiBoard } from "@/components/field/rfi-board";
import { fieldBase } from "@/lib/projects";
import { loadProject } from "@/lib/suite/project-route";
import { listFieldRfis } from "@/lib/suite/store";

export const metadata: Metadata = {
  title: "ContiField RFIs",
};

type RfiPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; id?: string }>;
};

export default async function ProjectFieldRfisPage({ params, searchParams }: RfiPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [project, rfis] = await Promise.all([loadProject(id), listFieldRfis(id)]);

  return (
    <>
      <FieldPersistBanner persist={rfis.persist} />
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold tracking-wide text-field-ink uppercase">RFIs</h1>
        <p className="mt-1 text-sm text-field-muted">Questions from {project.name} — open, overdue, and closed.</p>
      </div>
      <RfiBoard
        rfis={rfis.rows}
        initialOpen={query.new === "1"}
        editingId={query.id ?? ""}
        fieldBase={fieldBase(project.id)}
        projectId={project.id}
      />
    </>
  );
}
