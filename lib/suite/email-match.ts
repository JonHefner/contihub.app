/** Escape a value so Postgres ILIKE matches it exactly, still case-insensitive. */
export function ilikeExact(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
