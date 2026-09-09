import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppTiles } from "@/components/app-tiles";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ops hub",
};

export default async function HubPage() {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    redirect("/login?next=/app");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy-900 text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo light href="/app" />
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-steel-300 sm:block">{user.email}</p>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
          Continental Construction of Ohio
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900">
          Welcome to ContiHub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-600">
          The live ops portal. Open ContiHub below, or wait for the rest of the Conti suite —
          ContiCost, ContiField, ContiCRM, ContiSafety, ContiTraK, and Conti Bid.
        </p>
        <div className="mt-8">
          <AppTiles />
        </div>
      </main>
    </div>
  );
}
