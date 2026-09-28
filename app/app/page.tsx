import type { Metadata } from "next";
import { RevolvingTiles } from "@/components/revolving-tiles";
import { LoadSampleButton } from "@/components/suite/load-sample-button";
import { OpsPulse } from "@/components/suite/ops-pulse";
import { SuiteShell } from "@/components/suite-shell";
import { InviteTeammateForm } from "@/components/team/invite-teammate-form";
import { hubTiles } from "@/lib/apps";

export const metadata: Metadata = {
  title: "Ops hub",
};

export default function HubPage() {
  return (
    <SuiteShell>
      <div className="flex items-center gap-5">
        <img
          src="/brand/cc-mark-chrome.png"
          alt=""
          width={96}
          height={96}
          className="h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Continental Construction of Ohio
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
            Welcome to ContiHub
          </h1>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Start in Projects to open a job, then work ContiReview, ContiCRM, ContiField, ContiCost,
        Change Orders, ContiSafety, ContiTraK, or Conti Bid against that project only.
      </p>
      <RevolvingTiles tiles={hubTiles} />
      <OpsPulse />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <InviteTeammateForm />
        <LoadSampleButton />
      </div>
    </SuiteShell>
  );
}
