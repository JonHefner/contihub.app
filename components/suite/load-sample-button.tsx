"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadSampleWorkspaceAction } from "@/app/app/sample/actions";

export function LoadSampleButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-gold/25 bg-charcoal px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">SAMPLE data</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Loads a labeled SAMPLE Data Center: field logs and RFIs, Conti chase stages, cost lines, a bid package, and directory contractors. It does not send email.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            try {
              await loadSampleWorkspaceAction();
              setMessage("SAMPLE workspace is loaded.");
              router.refresh();
            } catch (caught) {
              setMessage(caught instanceof Error ? caught.message : "Could not load SAMPLE data.");
            }
          });
        }}
        className="mt-3 rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page disabled:opacity-70"
      >
        {pending ? "Loading…" : "Load SAMPLE"}
      </button>
      {message ? <p className="mt-2 text-sm text-gold-soft">{message}</p> : null}
    </div>
  );
}
