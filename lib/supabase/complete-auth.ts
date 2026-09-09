import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestOrigin, parseAuthCallbackSearch, resolveAuthCallbackFlow } from "@/lib/site";
import { getAuthCookieOptions, mergeCookieOptions } from "@/lib/supabase/cookies";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function handleAuthCallback(request: NextRequest) {
  const params = parseAuthCallbackSearch(new URL(request.url).searchParams);
  const origin = getRequestOrigin(request);
  const hostname = new URL(origin).hostname;
  const cookieOptions = getAuthCookieOptions(hostname);
  const flow = resolveAuthCallbackFlow(params);

  if (flow === "pkce" || flow === "otp") {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${origin}${params.next}`);

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged = mergeCookieOptions(options, cookieOptions);
            cookieStore.set(name, value, merged);
            response.cookies.set(name, value, merged);
          });
        },
      },
    });

    const { error } =
      flow === "pkce"
        ? await supabase.auth.exchangeCodeForSession(params.code!)
        : await supabase.auth.verifyOtp({
            type: params.type!,
            token_hash: params.tokenHash!,
          });

    if (!error) {
      return response;
    }

    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (flow === "hash") {
    return NextResponse.redirect(`${origin}/auth/complete?next=${encodeURIComponent(params.next)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
