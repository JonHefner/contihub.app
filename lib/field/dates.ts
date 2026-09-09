export function todayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = parseISODate(value);
  return !Number.isNaN(date.getTime());
}

export function addDaysISO(iso: string, days: number) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function weekdayLong(iso: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(parseISODate(iso));
}

export function formatFieldLong(iso: string) {
  if (!isValidISODate(iso)) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseISODate(iso));
}

export function formatFieldShort(iso: string) {
  if (!isValidISODate(iso)) {
    return iso;
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(parseISODate(iso));
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${weekday} ${month} ${day}`;
}

export function formatFieldDue(iso: string) {
  if (!isValidISODate(iso)) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseISODate(iso));
}
