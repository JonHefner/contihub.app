import type { Metadata } from "next";
import { FieldPersistBanner } from "@/components/field/persist-banner";
import { RfiBoard } from "@/components/field/rfi-board";
import { listFieldRfis } from "@/lib/suite/store";

export const metadata: Metadata = {
  title: "ContiField RFIs",
};

type RfiPageProps = {
  searchParams: Promise<{ new?: string; id?: string }>;
};

export default async function FieldRfisPage({ searchParams }: RfiPageProps) {
  const params = await searchParams;
  const { rows, persist } = await listFieldRfis();

  return (
    <>
      <FieldPersistBanner persist={persist} />
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold tracking-wide text-field-ink uppercase">
          RFIs
        </h1>
        <p className="mt-1 text-sm text-field-muted">
          Questions from the job — open, overdue, and closed.
        </p>
      </div>
      <RfiBoard rfis={rows} initialOpen={params.new === "1"} editingId={params.id ?? ""} />
    </>
  );
}
