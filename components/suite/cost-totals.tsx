import { formatMoneyExact } from "@/lib/suite/form";
import { summarizeCostLines, type CostLine } from "@/lib/cost/totals";

export function CostTotals({ rows }: { rows: CostLine[] }) {
  const totals = summarizeCostLines(rows);
  const cards = [
    ["Budget", totals.budget],
    ["Committed", totals.committed],
    ["Actual", totals.actual],
    ["Variance", totals.variance],
  ] as const;

  return (
    <dl className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-gold/20 bg-surface px-4 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{label}</dt>
          <dd className={`mt-2 font-display text-2xl ${label === "Variance" && value < 0 ? "text-red-300" : "text-ink-strong"}`}>
            {formatMoneyExact(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
