import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { firstHeaderValue } from "@/lib/site";
import { getAuthCookieOptions, mergeCookieOptions } from "@/lib/supabase/cookies";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const hostname = firstHeaderValue(headerStore.get("x-forwarded-host")) || firstHeaderValue(headerStore.get("host"));
  const cookieOptions = getAuthCookieOptions(hostname);

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, mergeCookieOptions(options, cookieOptions));
          });
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}
