import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Logo light href="/" />
        <div className="mt-10 rounded-sm bg-paper p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
            ContiHub access
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy-900">Sign in</h1>
          <p className="mt-2 text-sm text-steel-600">
            Use your Continental Construction of Ohio credentials.
          </p>
          {params.error === "auth" ? (
            <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Authentication could not be completed. Sign in again.
            </p>
          ) : null}
          <div className="mt-6">
            <AuthForm mode="login" nextPath={params.next} />
          </div>
        </div>
      </div>
    </div>
  );
}
