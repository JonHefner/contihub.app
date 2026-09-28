import type { Metadata } from "next";
import { AppTiles } from "@/components/app-tiles";
import { GalaxyHome } from "@/components/galaxy/galaxy-home";
import { LoadSampleButton } from "@/components/suite/load-sample-button";
import { OpsPulse } from "@/components/suite/ops-pulse";
import { SuiteShell } from "@/components/suite-shell";
import { InviteTeammateForm } from "@/components/team/invite-teammate-form";

export const metadata: Metadata = {
  title: "Ops hub",
};

/** Front page only. Suite routes keep the Conti Way shell. */

export default function HubPage() {
  return (
    <GalaxyHome
      pulse={<OpsPulse compact />}
      invite={<InviteTeammateForm />}
      sample={<LoadSampleButton />}
      list={
        <SuiteShell>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Continental Construction of Ohio
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
            Welcome to ContiHub
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Start in Projects to open a job, then work ContiReview, ContiCRM, ContiField, ContiCost,
            Change Orders, ContiSafety, ContiTraK, or Conti Bid against that project only.
          </p>
          <OpsPulse />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <InviteTeammateForm />
            <LoadSampleButton />
          </div>
          <div className="mt-8">
            <AppTiles />
          </div>
        </SuiteShell>
      }
    />
  );
}
