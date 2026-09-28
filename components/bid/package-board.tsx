"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SampleBadge } from "@/components/sample-badge";
import { formatDate } from "@/lib/suite/form";
import type { BidContractor, BidInvitee, BidPackage, PersistMode } from "@/lib/suite/types";
import { createBidPackage, removeBidPackage, sendBidInvites } from "@/app/app/bid/package-actions";
import type { InviteDraft } from "@/lib/bid/send";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none ring-gold/25 focus:border-gold focus:ring-4";

export function PackageBoard({
  projectId,
  projectName,
  packages,
  invitees,
  contractors,
  persist,
}: {
  projectId: string;
  projectName: string;
  packages: BidPackage[];
  invitees: BidInvitee[];
  contractors: BidContractor[];
  persist: PersistMode;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<InviteDraft[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return contractors;
    }
    return contractors.filter((row) =>
      [row.name, row.company, row.email, row.categories].join(" ").toLowerCase().includes(needle),
    );
  }, [contractors, query]);

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Bid packages</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-strong">Invitations</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Create a package, pick contractors, and send Conti Bid access with a magic link. Check Building Connected only after that invitation goes out the existing way. Conti Bid does not replace it. Drawings for v1 are a Teams link.
          </p>
        </div>
        <a href="/app/bid/directory" className="text-sm font-semibold text-gold">
          Contractor directory
        </a>
      </div>
      {persist === "memory" ? (
        <p className="mt-4 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Packages are in-session until the full court press SQL is applied. Magic links need SUPABASE_SERVICE_ROLE_KEY.
        </p>
      ) : null}

      <form
        className="mt-5 grid gap-3 rounded-2xl border border-gold/25 bg-charcoal p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          data.set("projectId", projectId);
          data.set("projectName", projectName);
          setMessage(null);
          startTransition(async () => {
            try {
              await createBidPackage(data);
              setMessage("Package saved.");
              form.reset();
              router.refresh();
            } catch (caught) {
              setMessage(caught instanceof Error ? caught.message : "Could not save the package.");
            }
          });
        }}
      >
        <label className="text-sm">
          <span className="text-muted">Title</span>
          <input name="title" required className={`${inputClass} mt-1`} placeholder="Early site and concrete" />
        </label>
        <label className="text-sm">
          <span className="text-muted">Bid due</span>
          <input name="dueAt" type="datetime-local" required className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="text-muted">Drawings Teams link</span>
          <input name="drawingsTeamsUrl" type="url" className={`${inputClass} mt-1`} placeholder="https://teams.microsoft.com/..." />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="text-muted">Notes</span>
          <textarea name="notes" rows={2} className={`${inputClass} mt-1`} />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="buildingConnectedSent" className="size-4 accent-gold" />
          Also invited on Building Connected
        </label>
        <button type="submit" disabled={pending} className="w-fit rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page disabled:opacity-70">
          Save package
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-gold-soft">{message}</p> : null}

      <ul className="mt-6 space-y-4">
        {packages.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-4 py-8 text-sm text-muted">No packages on this project yet.</li>
        ) : (
          packages.map((pkg) => {
            const rows = invitees.filter((row) => row.packageId === pkg.id);
            return (
              <li key={pkg.id} className="rounded-2xl border border-gold/25 bg-surface px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink-strong">
                      {pkg.title} <SampleBadge text={pkg.title} />
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Due {pkg.dueAt ? formatDate(pkg.dueAt.slice(0, 10)) : "—"}
                      {pkg.buildingConnectedSent ? " · Building Connected checked" : " · Building Connected not checked"}
                    </p>
                    {pkg.drawingsTeamsUrl ? (
                      <a href={pkg.drawingsTeamsUrl} className="mt-1 inline-block text-sm text-gold">
                        Teams drawings
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted">No Teams drawings link yet.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-300"
                    onClick={() => {
                      if (!window.confirm("Delete this package and its invitees?")) {
                        return;
                      }
                      startTransition(async () => {
                        await removeBidPackage(pkg.id, projectId);
                        router.refresh();
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
                {rows.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {rows.map((row) => (
                      <li key={row.id}>
                        {row.name || row.email} · {row.trade || "Trade not set"} · {row.status}
                        {row.magicLinkSentAt ? " · magic link minted" : " · magic link not minted"}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <form
        className="mt-6 rounded-2xl border border-gold/25 bg-charcoal p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          for (const id of selected) {
            data.append("contractorId", id);
          }
          setMessage(null);
          startTransition(async () => {
            try {
              const result = await sendBidInvites(data);
              setDrafts(result.drafts);
              setMessage(
                result.drafts.some((draft) => draft.magicLink)
                  ? "Invitees saved and magic links minted. Copy each draft or open mailto. Graph send is separate and optional."
                  : "Invitees saved. Magic links were not minted — copy the draft and set SUPABASE_SERVICE_ROLE_KEY.",
              );
              router.refresh();
            } catch (caught) {
              setMessage(caught instanceof Error ? caught.message : "Could not send invites.");
            }
          });
        }}
      >
        <h3 className="font-semibold text-ink-strong">Send invites</h3>
        <p className="mt-1 text-sm text-muted">
          Username on every invitation is the contractor work email. Access is a magic link, not a temporary password.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted">Package</span>
            <select name="packageId" required className={`${inputClass} mt-1`}>
              <option value="">Select a package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-muted">Trade</span>
            <input name="trade" required className={`${inputClass} mt-1`} placeholder="Cast-in-place concrete" />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="buildingConnectedSent" className="size-4 accent-gold" />
          Also invited on Building Connected
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter directory"
          className={`${inputClass} mt-3`}
        />
        <ul className="mt-3 max-h-64 space-y-2 overflow-auto">
          {filtered.map((row) => (
            <li key={row.id}>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-gold"
                  checked={selected.includes(row.id)}
                  onChange={(event) => {
                    setSelected((current) =>
                      event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id),
                    );
                  }}
                />
                <span>
                  <span className="font-semibold">{row.name}</span> · {row.company}
                  <span className="block text-muted">{row.email || "No email"} · {row.categories}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button type="submit" disabled={pending} className="mt-4 rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page disabled:opacity-70">
          {pending ? "Sending…" : `Send invites (${selected.length})`}
        </button>
      </form>

      {drafts ? (
        <ul className="mt-4 space-y-3">
          {drafts.map((draft) => (
            <li key={draft.inviteeId} className="rounded-2xl border border-gold/20 bg-surface px-4 py-3 text-sm">
              <p className="font-semibold">{draft.name}</p>
              <p className="text-muted">{draft.email}</p>
              {draft.magicLinkError ? <p className="mt-1 text-gold-soft">{draft.magicLinkError}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold" onClick={() => navigator.clipboard.writeText(draft.text)}>
                  Copy body
                </button>
                <button type="button" className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold" onClick={() => navigator.clipboard.writeText(draft.html)}>
                  Copy HTML
                </button>
                <a href={draft.mailto} className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
                  Open mailto
                </a>
                <button
                  type="button"
                  className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold"
                  onClick={() => {
                    startTransition(async () => {
                      const response = await fetch("/api/bid/graph-send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ inviteeId: draft.inviteeId }),
                      });
                      const body = (await response.json()) as { error?: string; missing?: string[] };
                      setMessage(
                        response.ok
                          ? `Graph accepted the message to ${draft.email}.`
                          : body.missing?.length
                            ? `Graph is not configured (${body.missing.join(", ")}). Use copy or mailto.`
                            : body.error || "Graph send failed.",
                      );
                    });
                  }}
                >
                  Try Graph send
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
