import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { SuiteNav } from "@/components/suite-nav";
import { bidderMayVisit } from "@/lib/access/paths";
import { resolveAccess } from "@/lib/suite/org";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await resolveAccess();
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (access.kind === "bidder" && pathname && !bidderMayVisit(pathname)) {
    redirect("/app/bid/invitations");
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="no-print border-b border-white/8 bg-charcoal text-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo light href="/app" />
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-muted sm:block">{access.email}</p>
            <SignOutButton />
          </div>
        </div>
      </header>
      <SuiteNav bidder={access.kind === "bidder"} />
      {children}
    </div>
  );
}
