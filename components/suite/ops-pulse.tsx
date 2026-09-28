import Link from "next/link";
import { countOpenRfis } from "@/lib/rfi/pipeline";
import { isDueBy, weekThrough } from "@/lib/ops/pulse";
import { listPackages } from "@/lib/suite/bid-store";
import { listRfiItems } from "@/lib/suite/rfi-store";
import { listBidChases, listChangeOrders, listFieldRfis } from "@/lib/suite/store";

export async function OpsPulse({ compact = false }: { compact?: boolean } = {}) {
  const [pipeline, rfis, packages, chases, orders] = await Promise.all([
    listRfiItems(),
    listFieldRfis(),
    listPackages(),
    listBidChases(),
    listChangeOrders(),
  ]);
  const through = weekThrough();
  const openRfis = countOpenRfis(pipeline.rows, rfis.rows);
  const packagesDue = packages.rows.filter((row) => isDueBy(row.dueAt, through)).length;
  const chasesDue = chases.rows.filter(
    (row) => isDueBy(row.dueDate, through) && !["Awarded", "Lost", "No Bid"].includes(row.status),
  ).length;
  const pendingOrders = orders.rows.filter((row) => row.status === "Proposed" || row.status === "Pricing").length;
  const memory = [pipeline.persist, rfis.persist, packages.persist, chases.persist, orders.persist].includes("memory");

  const cards = [
    { label: "Open RFIs", value: openRfis, href: "/app/rfi" },
    { label: "Packages due", value: packagesDue, href: "/app/bid" },
    { label: "Chase due", value: chasesDue, href: "/app/bid" },
    { label: "Pending COs", value: pendingOrders, href: "/app/change-orders" },
  ];

  if (compact) {
    return (
      <div>
        {memory ? <p className="mb-1 text-[10px] text-[#d9c98b]">In-session counts until SQL is applied.</p> : null}
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {cards.map((card) => (
            <li key={card.label} className="shrink-0">
              <Link href={card.href} className="block min-w-[7.5rem] rounded-xl border border-[#D4AF3780] bg-[#120a28ee] px-3 py-2 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">{card.label}</p>
                <p className="font-display text-2xl text-[#F5F0FF]">{card.value}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Ops pulse</p>
          <p className="mt-2 text-sm text-muted">Open RFIs, bids due or overdue in the next 7 days, and pending change orders.</p>
        </div>
        <Link href="/app/bid/directory" className="text-sm font-semibold text-gold">
          Contractor directory
        </Link>
      </div>
      {memory ? (
        <p className="mt-4 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Some counts are from the in-session store until the Supabase SQL in the README has been applied.
        </p>
      ) : null}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Link href={card.href} className="block rounded-2xl border border-gold/20 bg-surface px-4 py-4 transition hover:border-gold/55">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{card.label}</p>
              <p className="mt-2 font-display text-3xl text-ink-strong">{card.value}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
