"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveRfiAction } from "@/app/app/rfi/actions";
import { SampleBadge } from "@/components/sample-badge";
import {
  DEFAULT_OUTCOMES,
  DOC_REVIEW_STUB,
  RFI_ROLE_LABELS,
  RFI_STATUS_LABELS,
  RFI_TYPE_LABELS,
  activeSeats,
  buildRouteDraft,
  costPingNote,
  mailtoHref,
  routeRoleFromConfig,
  type RfiDistribution,
  type RfiItem,
  type RfiOutcome,
  type RfiRosterSeat,
  type RfiTypeRoute,
} from "@/lib/rfi/pipeline";
import type { BidContractor } from "@/lib/suite/types";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none ring-gold/25 focus:border-gold focus:ring-4";

const buttonClass = "rounded-sm bg-gold px-3 py-2 text-sm font-semibold text-page disabled:opacity-60";
const quietClass = "rounded-sm border border-gold/30 px-3 py-2 text-sm font-semibold text-gold disabled:opacity-60";

export function RfiForm({
  projectId,
  suggestedNumber,
  item,
  outcomes,
  distributions,
  roster,
  routes,
  contractors,
}: {
  projectId: string;
  suggestedNumber: string;
  item: RfiItem | null;
  outcomes: RfiOutcome[];
  distributions: RfiDistribution[];
  roster: RfiRosterSeat[];
  routes: RfiTypeRoute[];
  contractors: BidContractor[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [rfiType, setRfiType] = useState(item?.rfiType ?? "design_docs");
  const [urgency, setUrgency] = useState(item?.urgency ?? "normal");
  const [costImpact, setCostImpact] = useState(item?.costImpact ?? "unknown");
  const [subject, setSubject] = useState(item?.subject ?? "");
  const [number, setNumber] = useState(item?.number ?? suggestedNumber);
  const [question, setQuestion] = useState(item?.question ?? "");
  const [improved, setImproved] = useState(item?.improvedQuestion ?? "");
  const [citations, setCitations] = useState(item?.citations ?? "");
  const [fromName, setFromName] = useState(item?.fromName ?? "");
  const [toName, setToName] = useState(item?.toName ?? "");
  const [outcomeText, setOutcomeText] = useState(
    [0, 1, 2].map(
      (index) => outcomes.find((row) => row.sortOrder === index)?.label ?? (item ? "" : DEFAULT_OUTCOMES[index] ?? ""),
    ),
  );
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const selected = outcomes.findIndex((row) => row.selected);
    return selected >= 0 ? selected : item ? -1 : 1;
  });

  const routeRole = routeRoleFromConfig(rfiType, routes);
  const liaisons = activeSeats(roster, routeRole, projectId);
  const supers = activeSeats(roster, "superintendent", projectId);
  const ping = costPingNote(costImpact);
  const preview = useMemo(
    () =>
      buildRouteDraft({
        number,
        subject,
        urgency,
        fromName,
        toName: toName || liaisons[0]?.displayName || "",
        question,
        improvedQuestion: improved,
        citations,
        outcomes: outcomeText.map((label, index) => ({ label, selected: index === selectedIndex })),
        costPingNote: ping,
      }),
    [citations, fromName, improved, liaisons, number, outcomeText, ping, question, selectedIndex, subject, toName, urgency],
  );

  function run(intent: string) {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    data.set("intent", intent);
    data.set("projectId", projectId);
    setError(null);
    setNotice(null);
    startTransition(async () => {
      try {
        const saved = await saveRfiAction(data);
        setNotice(
          intent === "route"
            ? "Routed. The reviewer draft is ready to copy."
            : intent === "return" || intent === "close_docs"
              ? "Logged on the ContiHub RFI log and mirrored to ContiField."
              : intent === "distribute"
                ? "Field log updated. Distribution drafts are ready to copy. Mail was not sent."
                : "Saved.",
        );
        router.replace(`/app/projects/${projectId}/rfi?id=${saved.id}`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save this RFI.");
      }
    });
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setNotice("Copied.");
  }

  return (
    <form ref={formRef} className="rounded-2xl border border-gold/25 bg-charcoal p-4" onSubmit={(event) => event.preventDefault()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-2xl text-ink-strong">
          {item ? item.number : "New RFI"} <SampleBadge text={subject} />
        </h3>
        {item ? (
          <span className="rounded-sm bg-royal-deep px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-soft">
            {RFI_STATUS_LABELS[item.status]}
          </span>
        ) : null}
      </div>
      <input type="hidden" name="id" value={item?.id ?? ""} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-sm text-muted">
          Number
          <input className={`${inputClass} mt-1`} name="number" value={number} onChange={(event) => setNumber(event.target.value)} required />
        </label>
        <label className="block text-sm text-muted">
          Date required
          <input className={`${inputClass} mt-1`} type="date" name="dateRequired" defaultValue={item?.dateRequired ?? ""} />
        </label>
        <label className="block text-sm text-muted md:col-span-2">
          Subject
          <input className={`${inputClass} mt-1`} name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} required />
        </label>
        <label className="block text-sm text-muted">
          From
          <input className={`${inputClass} mt-1`} name="fromName" value={fromName} onChange={(event) => setFromName(event.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          To
          <input className={`${inputClass} mt-1`} name="toName" value={toName} onChange={(event) => setToName(event.target.value)} />
        </label>
        <label className="block text-sm text-muted">
          Urgency
          <select className={`${inputClass} mt-1`} name="urgency" value={urgency} onChange={(event) => setUrgency(event.target.value as typeof urgency)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          RFI type
          <select className={`${inputClass} mt-1`} name="rfiType" value={rfiType} onChange={(event) => setRfiType(event.target.value as typeof rfiType)}>
            <option value="design_docs">{RFI_TYPE_LABELS.design_docs}</option>
            <option value="owner_decision">{RFI_TYPE_LABELS.owner_decision}</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Cost impact
          <select className={`${inputClass} mt-1`} name="costImpact" value={costImpact} onChange={(event) => setCostImpact(event.target.value as typeof costImpact)}>
            <option value="unknown">Unknown</option>
            <option value="add">Add</option>
            <option value="deduct">Deduct</option>
            <option value="none">None</option>
          </select>
        </label>
        <label className="block text-sm text-muted">
          Schedule impact
          <select className={`${inputClass} mt-1`} name="scheduleImpact" defaultValue={item?.scheduleImpact ?? "unknown"}>
            <option value="unknown">Unknown</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-muted">
        Question
        <textarea className={`${inputClass} mt-1 min-h-20`} name="question" value={question} onChange={(event) => setQuestion(event.target.value)} />
      </label>

      <section className="mt-5 rounded-xl border border-gold/20 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Doc review</h4>
        <p className="mt-2 text-sm leading-6 text-muted">{DOC_REVIEW_STUB}</p>
        <label className="mt-3 block text-sm text-muted">
          Teams documents link
          <input className={`${inputClass} mt-1`} name="teamsDocsUrl" defaultValue={item?.teamsDocsUrl ?? ""} placeholder="https://teams.microsoft.com/..." />
        </label>
        <label className="mt-3 block text-sm text-muted">
          Citations
          <textarea className={`${inputClass} mt-1 min-h-20`} name="citations" value={citations} onChange={(event) => setCitations(event.target.value)} />
        </label>
        <label className="mt-3 block text-sm text-muted">
          Doc review notes
          <textarea className={`${inputClass} mt-1 min-h-20`} name="docReviewNotes" defaultValue={item?.docReviewNotes ?? ""} />
        </label>
        <label className="mt-3 flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="docsAlreadyAnswer" value="yes" defaultChecked={item?.docsAlreadyAnswer ?? false} className="mt-1" />
          Documents already answer this. Close with the drafter and do not issue.
        </label>
      </section>

      <label className="mt-4 block text-sm text-muted">
        Improved question
        <textarea className={`${inputClass} mt-1 min-h-20`} name="improvedQuestion" value={improved} onChange={(event) => setImproved(event.target.value)} />
      </label>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Suggested outcomes</legend>
        <p className="mt-2 text-sm text-muted">Edit the wording, then select the one Conti will carry into the route draft.</p>
        <div className="mt-3 grid gap-3">
          {outcomeText.map((value, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="radio"
                name="selectedIndex"
                value={String(index)}
                checked={selectedIndex === index}
                onChange={() => setSelectedIndex(index)}
                className="mt-3"
                aria-label={`Select outcome ${index + 1}`}
              />
              <input
                className={inputClass}
                name={`outcome${index}`}
                value={value}
                onChange={(event) => {
                  const next = outcomeText.slice();
                  next[index] = event.target.value;
                  setOutcomeText(next);
                }}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {ping ? <p className="mt-4 text-sm text-gold-soft">{ping}</p> : null}

      <section className="mt-5 rounded-xl border border-gold/20 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Route</h4>
        <p className="mt-2 text-sm text-muted">
          {RFI_TYPE_LABELS[rfiType]} goes to {routeRole ? RFI_ROLE_LABELS[routeRole] : "the roster"}.{" "}
          {liaisons.length === 0
            ? "No active seat for that role. Add one on the roster before routing."
            : `Active: ${liaisons.map((seat) => seat.displayName + (seat.email ? ` (${seat.email})` : " (email TBD)")).join(", ")}.`}
        </p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-sm bg-surface-2 p-3 text-xs leading-5 text-ink">{preview.subject}{"\n\n"}{preview.body}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={quietClass} onClick={() => copyText(`${preview.subject}\n\n${preview.body}`)}>
            Copy route draft
          </button>
          {liaisons[0]?.email ? (
            <a className={quietClass} href={mailtoHref(liaisons[0].email, preview.subject, preview.body)}>
              Mailto {liaisons[0].displayName}
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-gold/20 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Return and log</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-muted">
            Date returned
            <input className={`${inputClass} mt-1`} type="date" name="returnedAt" defaultValue={item?.returnedAt ?? ""} />
          </label>
          <label className="block text-sm text-muted">
            Log status
            <select className={`${inputClass} mt-1`} name="returnStatus" defaultValue={item?.status === "waiting" || item?.status === "closed" || item?.status === "complete" ? item.status : "closed"}>
              <option value="waiting">Waiting</option>
              <option value="closed">Closed</option>
              <option value="complete">Complete</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm text-muted">
          Official response
          <textarea className={`${inputClass} mt-1 min-h-20`} name="officialResponse" defaultValue={item?.officialResponse ?? ""} />
        </label>
      </section>

      <section className="mt-5 rounded-xl border border-gold/20 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Push to field and subs</h4>
        <p className="mt-2 text-sm text-muted">
          Superintendent seats: {supers.length === 0 ? "none active." : supers.map((seat) => `${seat.displayName}${seat.email ? "" : " (email TBD)"}`).join(", ")}
          {" "}Drafts only. ContiHub does not send this mail.
        </p>
        <ul className="mt-3 grid max-h-40 gap-2 overflow-auto">
          {contractors.slice(0, 40).map((contractor) => (
            <li key={contractor.id}>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="contractorId" value={contractor.id} />
                {contractor.company || contractor.name} {contractor.email ? `· ${contractor.email}` : ""}
              </label>
            </li>
          ))}
        </ul>
        {distributions.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {distributions.map((row) => (
              <li key={row.id} className="rounded-sm bg-surface-2 p-3 text-sm text-ink">
                <p className="font-semibold">
                  {row.recipientKind === "superintendent" ? "Superintendent" : "Subcontractor"} · {row.name || "Recipient"}
                  {row.email ? "" : " · email TBD"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={quietClass} onClick={() => copyText(`${row.draftSubject}\n\n${row.draftBody}`)}>
                    Copy draft
                  </button>
                  {row.email ? (
                    <a className={quietClass} href={mailtoHref(row.email, row.draftSubject, row.draftBody)}>
                      Mailto
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? <p className="mt-4 text-sm text-gold-soft">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-gold-soft">{notice}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={pending} onClick={() => run("save")}>
          Save
        </button>
        <button type="button" className={quietClass} disabled={pending} onClick={() => run("route")}>
          Route
        </button>
        <button type="button" className={quietClass} disabled={pending} onClick={() => run("close_docs")}>
          Close with drafter
        </button>
        <button type="button" className={quietClass} disabled={pending} onClick={() => run("return")}>
          Log return
        </button>
        <button type="button" className={buttonClass} disabled={pending} onClick={() => run("distribute")}>
          Push to field
        </button>
      </div>
    </form>
  );
}
