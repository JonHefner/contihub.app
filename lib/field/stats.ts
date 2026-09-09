import type { FieldReport, FieldRfi } from "@/lib/suite/types";
import { addDaysISO, todayISO } from "@/lib/field/dates";

export function logManHours(log: FieldReport) {
  if (log.manHours > 0) {
    return log.manHours;
  }
  return log.crewCount * 8;
}

export function weekManHours(logs: FieldReport[], today = todayISO()) {
  const start = addDaysISO(today, -6);
  return logs
    .filter((log) => log.date >= start && log.date <= today)
    .reduce((sum, log) => sum + logManHours(log), 0);
}

export function isRfiOverdue(rfi: FieldRfi, today = todayISO()) {
  return rfi.status === "open" && Boolean(rfi.dueDate) && rfi.dueDate < today;
}

export function openRfiCount(rfis: FieldRfi[]) {
  return rfis.filter((rfi) => rfi.status === "open").length;
}

export function nextRfiNumber(rfis: FieldRfi[]) {
  const max = rfis.reduce((current, rfi) => {
    const match = rfi.number.match(/(\d+)\s*$/);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 0);
  return `RFI-${String(max + 1).padStart(3, "0")}`;
}

export function rfiChip(number: string) {
  const match = number.match(/(\d+)\s*$/);
  return match ? match[1].padStart(3, "0").slice(-3) : number.slice(-3);
}

export function weatherSummary(log: FieldReport) {
  if (log.weather && log.weatherPm && log.weather !== log.weatherPm) {
    return `${log.weather} / ${log.weatherPm}`;
  }
  return log.weather || log.weatherPm || "—";
}
