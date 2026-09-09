import type { Metadata } from "next";
import { AppTiles } from "@/components/app-tiles";
import { SuiteShell } from "@/components/suite-shell";

export const metadata: Metadata = {
  title: "Ops hub",
};

export default function HubPage() {
  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
        Continental Construction of Ohio
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
        Welcome to ContiHub
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Start in Projects to open a job, then work ContiCRM, ContiField, ContiCost, ContiSafety,
        ContiTraK, or Conti Bid against that project only.
      </p>
      <div className="mt-8">
        <AppTiles />
      </div>
    </SuiteShell>
  );
}
