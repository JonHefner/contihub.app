"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadSampleChangeOrders } from "@/app/app/change-orders/actions";

export function LoadSampleChangeOrdersButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-5">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await loadSampleChangeOrders(projectId);
              router.refresh();
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Unable to load sample COs.");
            }
          });
        }}
        className="rounded-sm border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold transition hover:border-gold hover:bg-gold/10 disabled:opacity-70"
      >
        {pending ? "Loading sample…" : "Load Midwest Stadium sample COs"}
      </button>
      <p className="mt-2 max-w-xl text-xs leading-5 text-muted">
        Fictional demo rows only (Proposed / Pricing / Approved / Rejected, including a deduct). Does not
        use United CLE or live lead names.
      </p>
      {error ? (
        <p className="mt-2 rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
