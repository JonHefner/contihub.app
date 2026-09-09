import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import {
  canonicalizeOrigin,
  getAuthCallbackUrl,
  getAuthCookieOptions,
  getPublicOrigin,
  getRequestOrigin,
  getSiteUrl,
  isAllowedHost,
  mergeCookieOptions,
  parseAuthCallbackSearch,
  resolveAuthCallbackFlow,
  safeNextPath,
} from "./site.ts";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_VERCEL_URL",
  "VERCEL_URL",
  "VERCEL_ENV",
  "NEXT_PUBLIC_VERCEL_ENV",
  "NODE_ENV",
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
  for (const key of ENV_KEYS) {
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("canonicalizeOrigin", () => {
  test("maps apex production host to www", () => {
    assert.equal(canonicalizeOrigin("https://contihub.app"), "https://www.contihub.app");
    assert.equal(canonicalizeOrigin("https://contihub.app/"), "https://www.contihub.app");
    assert.equal(canonicalizeOrigin("contihub.app"), "https://www.contihub.app");
  });

  test("keeps www, localhost, and preview hosts", () => {
    assert.equal(canonicalizeOrigin("https://www.contihub.app"), "https://www.contihub.app");
    assert.equal(canonicalizeOrigin("http://localhost:3000"), "http://localhost:3000");
    assert.equal(
      canonicalizeOrigin("https://contihub-git-main.vercel.app"),
      "https://contihub-git-main.vercel.app",
    );
  });
});

describe("getSiteUrl", () => {
  test("canonicalizes NEXT_PUBLIC_SITE_URL apex values to www", () => {
    setEnv({
      NEXT_PUBLIC_SITE_URL: "https://contihub.app",
      NODE_ENV: "production",
      VERCEL_ENV: "production",
    });
    assert.equal(getSiteUrl(), "https://www.contihub.app");
  });

  test("uses localhost in development when site URL is unset", () => {
    setEnv({ NODE_ENV: "development" });
    assert.equal(getSiteUrl(), "http://localhost:3000");
  });

  test("uses Vercel preview URL when site URL is unset", () => {
    setEnv({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_VERCEL_URL: "contihub-preview.vercel.app",
    });
    assert.equal(getSiteUrl(), "https://contihub-preview.vercel.app");
  });
});

describe("getRequestOrigin", () => {
  test("prefers allowlisted forwarded host and canonicalizes apex to www", () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: "https://contihub.app", NODE_ENV: "production" });
    const origin = getRequestOrigin({
      headers: new Headers({
        "x-forwarded-host": "contihub.app",
        "x-forwarded-proto": "https",
      }),
      nextUrl: { host: "localhost:3000", origin: "http://localhost:3000", protocol: "http:" },
    });
    assert.equal(origin, "https://www.contihub.app");
  });

  test("rejects untrusted forwarded hosts", () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: "https://www.contihub.app", NODE_ENV: "production" });
    const origin = getRequestOrigin({
      headers: new Headers({
        "x-forwarded-host": "evil.example",
        host: "evil.example",
      }),
      nextUrl: { host: "evil.example", origin: "https://evil.example", protocol: "https:" },
    });
    assert.equal(origin, "https://www.contihub.app");
  });

  test("keeps localhost for local requests", () => {
    setEnv({ NODE_ENV: "development" });
    const origin = getRequestOrigin({
      headers: new Headers({ host: "localhost:3000" }),
      nextUrl: { host: "localhost:3000", origin: "http://localhost:3000", protocol: "http:" },
    });
    assert.equal(origin, "http://localhost:3000");
  });
});

describe("isAllowedHost", () => {
  test("allows production, local, and Vercel hosts only", () => {
    assert.equal(isAllowedHost("www.contihub.app"), true);
    assert.equal(isAllowedHost("contihub.app"), true);
    assert.equal(isAllowedHost("localhost:3000"), true);
    assert.equal(isAllowedHost("something.vercel.app"), true);
    assert.equal(isAllowedHost("evil.example"), false);
  });
});

describe("getAuthCallbackUrl", () => {
  test("points at the canonical www callback", () => {
    setEnv({ NEXT_PUBLIC_SITE_URL: "https://contihub.app", NODE_ENV: "production" });
    assert.equal(getAuthCallbackUrl("/app"), "https://www.contihub.app/auth/callback?next=%2Fapp");
    assert.equal(getPublicOrigin(), "https://www.contihub.app");
  });
});

describe("safeNextPath", () => {
  test("rejects open redirects", () => {
    assert.equal(safeNextPath("/app/crm"), "/app/crm");
    assert.equal(safeNextPath("https://evil.example"), "/app");
    assert.equal(safeNextPath("//evil.example"), "/app");
    assert.equal(safeNextPath(null), "/app");
  });
});

describe("getAuthCookieOptions", () => {
  test("shares cookies across apex and www on the production domain", () => {
    assert.deepEqual(getAuthCookieOptions("www.contihub.app"), {
      domain: ".contihub.app",
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    assert.deepEqual(getAuthCookieOptions("contihub.app"), {
      domain: ".contihub.app",
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  test("keeps host-only cookies on localhost and preview hosts", () => {
    assert.deepEqual(getAuthCookieOptions("localhost"), {
      path: "/",
      sameSite: "lax",
      secure: false,
    });
    assert.deepEqual(getAuthCookieOptions("contihub-git-main.vercel.app"), {
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });
});

describe("mergeCookieOptions", () => {
  test("preserves Supabase maxAge while forcing domain and SameSite", () => {
    const merged = mergeCookieOptions(
      { path: "/other", sameSite: "none", secure: false, maxAge: 60, httpOnly: true },
      "www.contihub.app",
    );
    assert.equal(merged.domain, ".contihub.app");
    assert.equal(merged.path, "/");
    assert.equal(merged.sameSite, "lax");
    assert.equal(merged.secure, true);
    assert.equal(merged.maxAge, 60);
    assert.equal(merged.httpOnly, true);
  });
});

describe("parseAuthCallbackSearch", () => {
  test("reads PKCE code and next", () => {
    const params = parseAuthCallbackSearch(new URLSearchParams("code=abc&next=/app/crm"));
    assert.deepEqual(params, {
      code: "abc",
      tokenHash: null,
      type: null,
      next: "/app/crm",
      error: null,
    });
    assert.equal(resolveAuthCallbackFlow(params), "pkce");
  });

  test("reads token_hash OTP params and defaults type to email", () => {
    const params = parseAuthCallbackSearch(new URLSearchParams("token_hash=otp123&next=/app"));
    assert.equal(params.tokenHash, "otp123");
    assert.equal(params.type, "email");
    assert.equal(resolveAuthCallbackFlow(params), "otp");
  });

  test("keeps explicit signup OTP type", () => {
    const params = parseAuthCallbackSearch(
      new URLSearchParams("token_hash=otp123&type=signup&next=/app"),
    );
    assert.equal(params.type, "signup");
    assert.equal(resolveAuthCallbackFlow(params), "otp");
  });

  test("treats missing server params as a client hash fallback", () => {
    const params = parseAuthCallbackSearch(new URLSearchParams("next=/app"));
    assert.equal(resolveAuthCallbackFlow(params), "hash");
  });

  test("surfaces Supabase error query params", () => {
    const params = parseAuthCallbackSearch(
      new URLSearchParams("error=access_denied&error_code=otp_expired"),
    );
    assert.equal(resolveAuthCallbackFlow(params), "error");
  });
});
