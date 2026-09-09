"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { safeNextPath } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

type AuthCompleteProps = {
  nextPath?: string;
};

export function AuthComplete({ nextPath }: AuthCompleteProps) {
  const router = useRouter();
  const next = safeNextPath(nextPath);
  const [message, setMessage] = useState("Finishing confirmation…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const supabase = createClient();
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            throw error;
          }
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }
          if (!data.session) {
            throw new Error("No session in confirmation link");
          }
        }

        if (!cancelled) {
          router.replace(next);
          router.refresh();
        }
      } catch {
        if (!cancelled) {
          setMessage("Authentication could not be completed. Redirecting to sign in…");
          router.replace("/login?error=auth");
        }
      }
    }

    void finish();

    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return <p className="text-sm text-muted">{message}</p>;
}
