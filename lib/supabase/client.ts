import { createBrowserClient } from "@supabase/ssr";
import { getAuthCookieOptions } from "@/lib/supabase/cookies";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieOptions: getAuthCookieOptions(),
  });
}
