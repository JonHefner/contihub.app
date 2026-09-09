import type { Metadata } from "next";
import { AppTiles } from "@/components/app-tiles";

export const metadata: Metadata = {
  title: "Ops hub",
};

export default function HubPage() {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
        Continental Construction of Ohio
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900">
        Welcome to ContiHub
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-600">
        Home board for the Conti suite. Open ContiCRM, ContiField, ContiCost, ContiSafety,
        ContiTraK, or Conti Bid — or stay here to jump between them.
      </p>
      <div className="mt-8">
        <AppTiles />
      </div>
    </>
  );
}
