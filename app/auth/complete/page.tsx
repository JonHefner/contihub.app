import type { Metadata } from "next";
import { AuthComplete } from "@/components/auth-complete";
import { AuthPanel } from "@/components/auth-panel";
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
    <AuthPanel
      title="Completing sign-in"
      description="Confirming your session and returning you to ContiHub."
    >
      <AuthComplete nextPath={safeNextPath(params.next)} />
    </AuthPanel>
  );
}
