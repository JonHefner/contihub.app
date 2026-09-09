import type { Metadata } from "next";
import { AuthComplete } from "@/components/auth-complete";
import { Logo } from "@/components/logo";
import { safeNextPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Completing sign-in",
};

type AuthCompletePageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AuthCompletePage({ searchParams }: AuthCompletePageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Logo light href="/" />
        <div className="mt-10 rounded-sm bg-paper p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
            ContiHub access
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy-900">
            Completing sign-in
          </h1>
          <p className="mt-2 text-sm text-steel-600">
            Confirming your session and returning you to ContiHub.
          </p>
          <div className="mt-6">
            <AuthComplete nextPath={safeNextPath(params.next)} />
          </div>
        </div>
      </div>
    </div>
  );
}
