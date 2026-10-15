import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/projects/project-form";
import { ChangeOrderSummaryCards } from "@/components/suite/change-order-summary";
import { SuiteShell } from "@/components/suite-shell";
import { summarizeChangeOrders } from "@/lib/change-orders";
import { countOpenRfis } from "@/lib/rfi/pipeline";
import { SUITE_APP_BLURBS, SUITE_APP_KEYS, SUITE_APP_LABELS, projectHref } from "@/lib/projects";
import { loadProject } from "@/lib/suite/project-route";
import { listRfiItemSignals } from "@/lib/suite/rfi-store";
import {
  countSuiteRows,
  listChangeOrderFigures,
  listFieldRfiSignals,
} from "@/lib/suite/store";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await loadProject(id);
  return { title: project.name };
}

export default async function ProjectHomePage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  const [logs, leads, costs, safety, trak, bids, fieldRfis, pipeline, changeOrders] = await Promise.all([
    countSuiteRows("field_reports", id),
    countSuiteRows("crm_leads", id),
    countSuiteRows("cost_jobs", id),
    countSuiteRows("safety_logs", id),
    countSuiteRows("trak_milestones", id),
    countSuiteRows("bid_chases", id),
    listFieldRfiSignals(id),
    listRfiItemSignals(id),
    listChangeOrderFigures(id),
  ]);

  const counts: Record<(typeof SUITE_APP_KEYS)[number], number> = {
    field: logs.count,
    rfi: pipeline.rows.length,
    crm: leads.count,
    cost: costs.count,
    "change-orders": changeOrders.rows.length,
    safety: safety.count,
    trak: trak.count,
    bid: bids.count,
  };
  const openRfiCount = countOpenRfis(pipeline.rows, fieldRfis.rows);
  const changeOrderSummary = summarizeChangeOrders(changeOrders.rows);

  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Project</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-strong">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {project.jobNumber ? `Job ${project.jobNumber}` : "No job #"}
            {project.address ? ` · ${project.address}` : ""}
          </p>
        </div>
        <span className="w-fit rounded-sm bg-royal-deep px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-soft">
          {project.status}
        </span>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Daily logs</dt>
          <dd className="mt-2 font-display text-3xl text-ink-strong">{logs.count}</dd>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Open RFIs</dt>
          <dd className="mt-2 font-display text-3xl text-ink-strong">
            <Link href={projectHref(project.id, "rfi")} className="hover:text-gold">
              {openRfiCount}
            </Link>
          </dd>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Cost jobs</dt>
          <dd className="mt-2 font-display text-3xl text-ink-strong">{costs.count}</dd>
        </div>
      </dl>

      <div className="mt-10">
        <ChangeOrderSummaryCards summary={changeOrderSummary} projectId={project.id} showLink />
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold text-ink-strong">Suite for this job</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {SUITE_APP_KEYS.map((app) => (
          <li key={app}>
            <Link
              href={projectHref(project.id, app)}
              className="block rounded-2xl border border-gold/25 bg-charcoal px-5 py-4 transition hover:border-gold/55"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink-strong">{SUITE_APP_LABELS[app]}</p>
                <span className="text-xs font-semibold text-gold">{counts[app]}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{SUITE_APP_BLURBS[app]}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-semibold text-ink-strong">Project settings</h2>
      <p className="mt-2 mb-5 text-sm text-muted">Update the job name, number, address, or status.</p>
      <ProjectForm project={project} />
    </SuiteShell>
  );
}
