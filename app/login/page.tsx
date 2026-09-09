import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthPanel
      title="Sign in"
      description="Use your Continental Construction of Ohio credentials."
    >
      {params.error === "auth" ? (
        <p className="mb-4 rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Authentication could not be completed. Sign in again.
        </p>
      ) : null}
      <AuthForm mode="login" nextPath={params.next} />
    </AuthPanel>
  );
}
