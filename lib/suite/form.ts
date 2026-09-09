export function readString(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

export function readRequired(formData: FormData, key: string, label = key) {
  const value = readString(formData, key);
  if (!value) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

export function readNumber(formData: FormData, key: string, label = key) {
  const raw = readString(formData, key, "0");
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a number.`);
  }
  return value;
}

export function readMoney(formData: FormData, key: string, label = key) {
  const value = readNumber(formData, key, label);
  if (value < 0) {
    throw new Error(`${label} cannot be negative.`);
  }
  return Math.round(value * 100) / 100;
}

export function readInt(formData: FormData, key: string, label = key, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const value = Math.round(readNumber(formData, key, label));
  if (value < min || value > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }
  return value;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoneyExact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
