import Link from "next/link";
import { isDueBy, weekThrough } from "@/lib/ops/pulse";
import { listPackages } from "@/lib/suite/bid-store";
import { listBidChases, listChangeOrders, listFieldRfis } from "@/lib/suite/store";

export async function OpsPulse() {
  const [rfis, packages, chases, orders] = await Promise.all([
    listFieldRfis(),
    listPackages(),
    listBidChases(),
    listChangeOrders(),
  ]);
  const through = weekThrough();
  const openRfis = rfis.rows.filter((row) => row.status === "open").length;
  const packagesDue = packages.rows.filter((row) => isDueBy(row.dueAt, through)).length;
  const chasesDue = chases.rows.filter(
    (row) => isDueBy(row.dueDate, through) && !["Awarded", "Lost", "No Bid"].includes(row.status),
  ).length;
  const pendingOrders = orders.rows.filter((row) => row.status === "Proposed" || row.status === "Pricing").length;
  const memory = [rfis.persist, packages.persist, chases.persist, orders.persist].includes("memory");

  const cards = [
    { label: "Open RFIs", value: openRfis, href: "/app/field" },
    { label: "Packages due", value: packagesDue, href: "/app/bid" },
    { label: "Chase due", value: chasesDue, href: "/app/bid" },
    { label: "Pending COs", value: pendingOrders, href: "/app/change-orders" },
  ];

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
