export const DEFAULT_SITE_URL = "https://contihub.app";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function getAuthCallbackUrl(next = "/app") {
  const safeNext = next.startsWith("/") ? next : "/app";
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function safeNextPath(next: string | null | undefined, fallback = "/app") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
