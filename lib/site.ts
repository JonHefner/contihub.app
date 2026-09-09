export const APEX_SITE_HOST = "contihub.app";
export const CANONICAL_SITE_HOST = "www.contihub.app";
export const CANONICAL_SITE_URL = `https://${CANONICAL_SITE_HOST}`;
export const AUTH_COOKIE_DOMAIN = ".contihub.app";

/** @deprecated Use CANONICAL_SITE_URL. Kept so existing imports keep working. */
export const DEFAULT_SITE_URL = CANONICAL_SITE_URL;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function firstHeaderValue(value: string | null | undefined) {
  return value?.split(",")[0]?.trim() || "";
}

export function hostnameOf(host: string) {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function isLocalHost(host: string) {
  return LOCAL_HOSTS.has(hostnameOf(host));
}

export function isAllowedHost(host: string) {
  const hostname = hostnameOf(host);
  if (!hostname) {
    return false;
  }
  if (hostname === APEX_SITE_HOST || hostname === CANONICAL_SITE_HOST) {
    return true;
  }
  if (LOCAL_HOSTS.has(hostname)) {
    return true;
  }
  if (hostname.endsWith(".vercel.app")) {
    return true;
  }
  return false;
}

export function canonicalizeOrigin(value: string) {
  const candidate = value.trim().replace(/\/$/, "");
  const withProtocol = candidate.includes("://") ? candidate : `https://${candidate}`;
  const url = new URL(withProtocol);

  if (url.hostname === APEX_SITE_HOST) {
    return CANONICAL_SITE_URL;
  }

  return url.origin;
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return canonicalizeOrigin(raw);
    } catch {
      // Fall through to preview / default origins.
    }
  }

  const vercelEnv = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelEnv === "preview" && vercelUrl) {
    try {
      return canonicalizeOrigin(vercelUrl);
    } catch {
      // Fall through to the canonical production origin.
    }
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return CANONICAL_SITE_URL;
}

export function getPublicOrigin() {
  if (typeof window !== "undefined" && isAllowedHost(window.location.host)) {
    return canonicalizeOrigin(window.location.origin);
  }
  return getSiteUrl();
}

export function getRequestOrigin(request: {
  headers: Headers;
  nextUrl: { host: string; origin: string; protocol: string };
}) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeaderValue(request.headers.get("host")) || request.nextUrl.host;

  if (!isAllowedHost(host)) {
    return getSiteUrl();
  }

  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const proto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : isLocalHost(host)
        ? "http"
        : "https";

  return canonicalizeOrigin(`${proto}://${host}`);
}

export function getAuthCallbackUrl(next = "/app") {
  const safeNext = safeNextPath(next);
  return `${getPublicOrigin()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function safeNextPath(next: string | null | undefined, fallback = "/app") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

export type AuthCookieOptions = {
  domain?: string;
  path: string;
  sameSite: "lax";
  secure: boolean;
};

export function getAuthCookieOptions(hostname?: string | null): AuthCookieOptions {
  const host = hostnameOf(hostname ?? (typeof window !== "undefined" ? window.location.hostname : ""));

  if (host === APEX_SITE_HOST || host === CANONICAL_SITE_HOST) {
    return {
      domain: AUTH_COOKIE_DOMAIN,
      path: "/",
      sameSite: "lax",
      secure: true,
    };
  }

  return {
    path: "/",
    sameSite: "lax",
    secure: Boolean(host) && !isLocalHost(host),
  };
}

export function mergeCookieOptions<T extends Record<string, unknown>>(
  options: T | undefined,
  hostnameOrCookieOptions?: string | null | AuthCookieOptions,
) {
  const authOptions =
    hostnameOrCookieOptions && typeof hostnameOrCookieOptions === "object"
      ? hostnameOrCookieOptions
      : getAuthCookieOptions(hostnameOrCookieOptions);

  return {
    ...options,
    ...authOptions,
  };
}

export const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

export type EmailOtpTypeParam = (typeof EMAIL_OTP_TYPES)[number];

export type AuthCallbackFlow = "pkce" | "otp" | "hash" | "error";

export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpTypeParam | null;
  next: string;
  error: string | null;
};

export function parseEmailOtpType(value: string | null): EmailOtpTypeParam | null {
  if (!value) {
    return null;
  }
  return EMAIL_OTP_TYPES.includes(value as EmailOtpTypeParam) ? (value as EmailOtpTypeParam) : null;
}

export function parseAuthCallbackSearch(searchParams: URLSearchParams): AuthCallbackParams {
  const tokenHash = searchParams.get("token_hash");
  const type = parseEmailOtpType(searchParams.get("type")) ?? (tokenHash ? "email" : null);

  return {
    code: searchParams.get("code"),
    tokenHash,
    type,
    next: safeNextPath(searchParams.get("next")),
    error: searchParams.get("error") || searchParams.get("error_code"),
  };
}

export function resolveAuthCallbackFlow(params: AuthCallbackParams): AuthCallbackFlow {
  if (params.error) {
    return "error";
  }
  if (params.code) {
    return "pkce";
  }
  if (params.tokenHash && params.type) {
    return "otp";
  }
  return "hash";
}
