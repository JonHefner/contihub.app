import Link from "next/link";
import { RosterPanel } from "@/components/rfi/roster-panel";
import { RfiForm } from "@/components/rfi/rfi-form";
import { ProjectScopeBar } from "@/components/projects/project-scope-bar";
import { SampleBadge } from "@/components/sample-badge";
import { SuiteShell } from "@/components/suite-shell";
import { RFI_STATUS_LABELS, nextPipelineNumber } from "@/lib/rfi/pipeline";
import { listContractors } from "@/lib/suite/bid-store";
import { listRfiDistributions, listRfiItems, listRfiOutcomes, listRoster, listTypeRoutes } from "@/lib/suite/rfi-store";
import type { Project } from "@/lib/suite/types";

export async function RfiScreen({ project, activeId }: { project: Project; activeId: string }) {
  const [items, roster, routes, contractors] = await Promise.all([
    listRfiItems(project.id),
    listRoster(),
    listTypeRoutes(),
    listContractors(),
  ]);
  const active = items.rows.find((row) => row.id === activeId) ?? null;
  const [outcomes, distributions] = active
    ? await Promise.all([listRfiOutcomes(active.id), listRfiDistributions(active.id)])
    : [[], []];
  const memory = [items.persist, roster.persist, contractors.persist].includes("memory");

  return (
    <SuiteShell>
      <ProjectScopeBar project={project} app="rfi" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">ContiReview</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink-strong">ContiReview</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Paste citations, then use the ContiReview form for a couple of suggested outcomes. Route design questions to the architect or owner decisions to the owner. When the answer comes back, log it here and push a draft to the Conti Field superintendent and the subs you pick.
          </p>
        </div>
        <Link href={`/app/projects/${project.id}/field/rfis`} className="text-sm font-semibold text-gold">
          ContiField RFI list
        </Link>
      </div>
      {memory ? (
        <p className="mb-4 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          This log is in-session until `supabase/migrations/20260928120000_rfi_pipeline.sql` is applied.
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <Link href={`/app/projects/${project.id}/rfi`} className="text-sm font-semibold text-gold">
            New RFI
          </Link>
          <ul className="mt-3 grid gap-2">
            {items.rows.length === 0 ? <li className="text-sm text-muted">No ContiReview items on this job yet.</li> : null}
            {items.rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/app/projects/${project.id}/rfi?id=${row.id}`}
                  className={`block rounded-xl border px-3 py-3 ${row.id === active?.id ? "border-gold bg-surface" : "border-gold/20 bg-charcoal"}`}
                >
                  <p className="font-semibold text-ink-strong">
                    {row.number} <SampleBadge text={`${row.number} ${row.subject}`} />
                  </p>
                  <p className="mt-1 text-sm text-muted">{row.subject}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gold">{RFI_STATUS_LABELS[row.status]}</p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <RfiForm
          key={active?.id ?? "new"}
          projectId={project.id}
          suggestedNumber={nextPipelineNumber(items.rows.map((row) => row.number))}
          item={active}
          outcomes={outcomes}
          distributions={distributions}
          roster={roster.rows}
          routes={routes.rows}
          contractors={contractors.rows}
        />
      </div>
      <RosterPanel projectId={project.id} roster={roster.rows} />
    </SuiteShell>
  );
}
