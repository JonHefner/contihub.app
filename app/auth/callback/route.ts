import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl, safeNextPath } from "@/lib/site";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const origin = getSiteUrl() || request.nextUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const redirectResponse = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";

      if (!isLocal && forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`, {
          headers: redirectResponse.headers,
        });
      }

      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
