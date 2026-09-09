import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Logo light href="/" />
        <div className="mt-10 rounded-sm bg-paper p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
            ContiHub access
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-steel-600">
            Request access to the Continental Construction of Ohio ops portal.
          </p>
          <div className="mt-6">
            <AuthForm mode="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
