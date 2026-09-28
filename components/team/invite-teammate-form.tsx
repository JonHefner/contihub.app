"use client";

import { useState, useTransition } from "react";
import { inviteTeammateAction } from "@/app/app/team/actions";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none ring-gold/25 focus:border-gold focus:ring-4";

export function InviteTeammateForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; text: string; mailto: string; magicLink: string | null } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-2xl border border-gold/25 bg-charcoal px-4 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get("email") ?? "");
        setMessage(null);
        startTransition(async () => {
          try {
            const result = await inviteTeammateAction(email);
            setDraft(result);
            setMessage(result.magicLink ? "Staff invite is ready. Copy the magic link or open the mail draft." : result.magicLinkError);
          } catch (caught) {
            setMessage(caught instanceof Error ? caught.message : "Could not invite that teammate.");
          }
        });
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Invite teammate</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Sends Conti staff access with a magic link. Staff share company projects. Bidders stay limited to invited packages.
      </p>
      <label className="mt-3 block text-sm">
        <span className="text-muted">Work email</span>
        <input name="email" type="email" required placeholder="ann@continentalcando.com" className={`${inputClass} mt-1`} />
      </label>
      <button type="submit" disabled={pending} className="mt-3 rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page disabled:opacity-70">
        {pending ? "Preparing…" : "Prepare staff invite"}
      </button>
      {message ? <p className="mt-2 text-sm text-gold-soft">{message}</p> : null}
      {draft ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold"
            onClick={() => navigator.clipboard.writeText(draft.text)}
          >
            Copy invite
          </button>
          <a href={draft.mailto} className="rounded-sm border border-gold/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
            Open mail draft
          </a>
        </div>
      ) : null}
    </form>
  );
}
