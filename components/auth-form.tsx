"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthCallbackUrl, safeNextPath } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const next = safeNextPath(nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const emailRedirectTo = getAuthCallbackUrl(next);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (!data.session) {
          setInfo(
            "Check your email to confirm your account. You will be returned to ContiHub after confirmation.",
          );
          return;
        }

        router.push(next);
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to authenticate.");
    } finally {
      setPending(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none ring-gold/25 transition focus:border-gold focus:ring-4"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none ring-gold/25 transition focus:border-gold focus:ring-4"
        />
      </div>

      {error ? (
        <p className="rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-sm border border-royal/40 bg-royal-deep/40 px-3 py-2 text-sm text-ink">
          {info}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold tracking-wide text-page transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        {isLogin ? (
          <>
            Need access?{" "}
            <Link href="/signup" className="font-medium text-gold underline-offset-4 hover:underline">
              Request an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gold underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
