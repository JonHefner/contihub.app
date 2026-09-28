"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveRosterAction, setRosterActiveAction } from "@/app/app/rfi/actions";
import { RFI_ROLE_LABELS, RFI_ROLES, type RfiRosterSeat } from "@/lib/rfi/pipeline";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none ring-gold/25 focus:border-gold focus:ring-4";

export function RosterPanel({ projectId, roster }: { projectId: string; roster: RfiRosterSeat[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink-strong">Deploy roster</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        Ann Saccone, Michael Might, Ryan Roberts, and Braden Farmer are operators who can act in ContiReview. Seats are rows. Add a person with a role. Remove them by marking the row inactive. Blank email means TBD.
        Owner liaison is empty until someone is added, so owner-decision RFIs stay here until that seat exists.
      </p>
      {error ? <p className="mt-3 text-sm text-gold-soft">{error}</p> : null}
      <ul className="mt-4 grid gap-2">
        {roster.map((seat) => (
          <li key={seat.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/20 bg-surface px-4 py-3">
            <div>
              <p className="font-semibold text-ink-strong">
                {seat.displayName}{" "}
                <span className="text-xs font-semibold uppercase tracking-wide text-gold">{RFI_ROLE_LABELS[seat.role]}</span>
              </p>
              <p className="text-sm text-muted">
                {seat.email || "Email TBD"}
                {seat.projectId ? " · this project" : " · all projects"}
                {seat.notes ? ` · ${seat.notes}` : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              className="rounded-sm border border-gold/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold"
              onClick={() => {
                const data = new FormData();
                data.set("id", seat.id);
                data.set("projectId", projectId);
                data.set("active", seat.active ? "no" : "yes");
                setError(null);
                startTransition(async () => {
                  try {
                    await setRosterActiveAction(data);
                    router.refresh();
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Unable to update the roster.");
                  }
                });
              }}
            >
              {seat.active ? "Active" : "Inactive"}
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-4 grid gap-3 rounded-2xl border border-gold/25 bg-charcoal p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          data.set("projectId", projectId);
          setError(null);
          startTransition(async () => {
            try {
              await saveRosterAction(data);
              form.reset();
              router.refresh();
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Unable to add that seat.");
            }
          });
        }}
      >
        <label className="block text-sm text-muted">
          Name
          <input className={`${inputClass} mt-1`} name="displayName" required />
        </label>
        <label className="block text-sm text-muted">
          Email
          <input className={`${inputClass} mt-1`} name="email" placeholder="Blank if TBD" />
        </label>
        <label className="block text-sm text-muted">
          Role
          <select className={`${inputClass} mt-1`} name="role" defaultValue="intake_reviewer">
            {RFI_ROLES.map((role) => (
              <option key={role} value={role}>
                {RFI_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-muted">
          Scope
          <select className={`${inputClass} mt-1`} name="projectScope" defaultValue="all">
            <option value="all">All projects</option>
            <option value="project">This project only</option>
          </select>
        </label>
        <label className="block text-sm text-muted md:col-span-2">
          Notes
          <input className={`${inputClass} mt-1`} name="notes" />
        </label>
        <div>
          <button type="submit" disabled={pending} className="rounded-sm bg-gold px-3 py-2 text-sm font-semibold text-page disabled:opacity-60">
            Add seat
          </button>
        </div>
      </form>
    </section>
  );
}
