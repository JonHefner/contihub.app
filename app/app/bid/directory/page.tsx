import type { Metadata } from "next";
import { DirectoryBoard } from "@/components/bid/directory-board";
import { SuiteShell } from "@/components/suite-shell";
import { listContractors } from "@/lib/suite/bid-store";
import { requireStaff } from "@/lib/suite/org";

export const metadata: Metadata = {
  title: "Contractor directory",
};

export default async function DirectoryPage() {
  await requireStaff();
  const { rows, persist } = await listContractors();

  return (
    <SuiteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Conti Bid</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong">
        Contractor directory
      </h1>
      <DirectoryBoard rows={rows} persist={persist} />
    </SuiteShell>
  );
}
