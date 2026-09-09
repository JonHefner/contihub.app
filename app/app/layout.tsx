import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { SuiteNav } from "@/components/suite-nav";
import { requireUser } from "@/lib/suite/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireUser();

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
      <SuiteNav />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
