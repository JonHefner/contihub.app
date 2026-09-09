import type { PersistMode } from "@/lib/suite/types";

export function FieldPersistBanner({ persist }: { persist: PersistMode }) {
  if (persist !== "memory") {
    return null;
  }

  return (
    <p className="mb-4 rounded-xl bg-field-surface px-3 py-2 text-sm text-field-ink field-shadow">
      Using an in-session store until Jon applies the Field and Projects SQL in order:{" "}
      <code className="font-mono text-xs">20260909160000_contifield_daily_log.sql</code> then{" "}
      <code className="font-mono text-xs">20260909180000_projects.sql</code> (after the base suite
      migration).
    </p>
  );
}
