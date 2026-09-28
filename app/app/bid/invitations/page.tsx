import type { Metadata } from "next";
import Link from "next/link";
import { SuiteShell } from "@/components/suite-shell";
import { formatDate } from "@/lib/suite/form";
import { listMyInvitations } from "@/lib/suite/bid-store";
import { markInvitesOpened, resolveAccess } from "@/lib/suite/org";

export const metadata: Metadata = {
  title: "My bid invitations",
};

export default async function InvitationsPage() {
  const access = await resolveAccess();
  await markInvitesOpened();
  const { rows, persist } = await listMyInvitations();

  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Conti Bid</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
        {access.kind === "bidder" ? "Your invitations" : "Invitation log"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {access.kind === "bidder"
          ? "You can see the bid packages sent to this email. Other ContiHub jobs stay with Conti staff."
          : "Staff can review packages they were copied on. Estimators build packages inside a project."}
      </p>
      {persist === "memory" ? (
        <p className="mt-4 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Invitations are in-session until the full court press SQL is applied.
        </p>
      ) : null}
      {access.kind === "staff" ? (
        <Link href="/app/bid" className="mt-4 inline-block text-sm font-semibold text-gold">
          Open Conti Bid projects
        </Link>
      ) : null}
      <ul className="mt-8 space-y-4">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-4 py-10 text-sm text-muted">
            No bid packages for this login yet.
          </li>
        ) : (
          rows.map((row) => (
            <li key={row.inviteeId} className="rounded-2xl border border-gold/25 bg-charcoal px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{row.projectName || "Project"}</p>
              <h2 className="mt-2 font-display text-2xl text-ink-strong">{row.title}</h2>
              <p className="mt-2 text-sm text-muted">
                Trade {row.trade || "—"} · Due {row.dueAt ? formatDate(row.dueAt.slice(0, 10)) : "—"} · {row.status}
              </p>
              {row.drawingsTeamsUrl ? (
                <a href={row.drawingsTeamsUrl} className="mt-3 inline-block text-sm font-semibold text-gold">
                  Open drawings in Teams
                </a>
              ) : (
                <p className="mt-3 text-sm text-muted">Drawings link has not been added yet.</p>
              )}
              {row.buildingConnectedSent ? (
                <p className="mt-2 text-sm text-muted">Also invited on Building Connected. That invitation is separate.</p>
              ) : null}
              {row.notes ? <p className="mt-2 text-sm leading-6 text-muted">{row.notes}</p> : null}
            </li>
          ))
        )}
      </ul>
    </SuiteShell>
  );
}
