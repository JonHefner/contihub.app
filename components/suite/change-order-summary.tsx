import Link from "next/link";
import type { ChangeOrderSummary } from "@/lib/change-orders";
import { formatMoneyExact } from "@/lib/suite/form";
import { projectHref } from "@/lib/projects";

export function ChangeOrderSummaryCards({
  summary,
  projectId,
  showLink = false,
}: {
  summary: ChangeOrderSummary;
  projectId?: string;
  showLink?: boolean;
}) {
  return (
    <div>
      {showLink && projectId ? (
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-strong">Change orders</h2>
            <p className="mt-1 text-sm text-muted">
              Pending vs approved, then net owner exposure (rejected COs stay out).
            </p>
          </div>
          <Link
            href={projectHref(projectId, "change-orders")}
            className="shrink-0 rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-page"
          >
            Open CO log
          </Link>
        </div>
      ) : null}
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Proposed</dt>
          <dd className="mt-2 font-display text-3xl text-ink-strong">{formatMoneyExact(summary.pendingTotal)}</dd>
          <p className="mt-2 text-xs text-muted">
            Proposed {formatMoneyExact(summary.proposedTotal)} · Pricing {formatMoneyExact(summary.pricingTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Approved</dt>
          <dd className="mt-2 font-display text-3xl text-ink-strong">{formatMoneyExact(summary.approvedTotal)}</dd>
          <p className="mt-2 text-xs text-muted">{summary.approvedCount} executed {summary.approvedCount === 1 ? "CO" : "COs"}</p>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-royal-deep px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Net owner exposure</dt>
          <dd className="mt-2 font-display text-3xl text-gold-soft">
            {formatMoneyExact(summary.netOwnerExposure)}
          </dd>
          <p className="mt-2 text-xs text-gold/80">
            Pending + approved · Rejected {formatMoneyExact(summary.rejectedTotal)} out
          </p>
        </div>
      </dl>
    </div>
  );
}
