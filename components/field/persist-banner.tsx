import type { PersistMode } from "@/lib/suite/types";

export function FieldPersistBanner({ persist }: { persist: PersistMode }) {
  if (persist !== "memory") {
    return null;
  }

  return (
    <p className="mb-4 rounded-xl bg-field-surface px-3 py-2 text-sm text-field-ink field-shadow">
      Using an in-session store until Jon applies{" "}
      <code className="font-mono text-xs">supabase/migrations/20260909160000_contifield_daily_log.sql</code>{" "}
      in the Supabase SQL editor (after the base suite migration).
    </p>
  );
}
