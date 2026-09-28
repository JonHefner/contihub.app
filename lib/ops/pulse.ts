export function isDueBy(value: string, through: Date) {
  if (!value) {
    return false;
  }
  const parsed = new Date(value.length <= 10 ? `${value.slice(0, 10)}T00:00:00` : value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.getTime() <= through.getTime();
}

export function weekThrough(now = new Date()) {
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return end;
}
