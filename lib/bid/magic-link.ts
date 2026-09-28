import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export type MagicLinkResult =
  | { ok: true; actionLink: string; userId: string | null }
  | { ok: false; reason: string };

export async function createMagicLink(email: string, nextPath: string): Promise<MagicLinkResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, reason: "Set SUPABASE_SERVICE_ROLE_KEY to mint Supabase magic links." };
  }

  const redirectTo = `${getSiteUrl()}/auth/complete?next=${encodeURIComponent(nextPath)}`;
  const magic = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  const invited = magic.error
    ? await admin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo, data: { conti_role: nextPath.includes("invitations") ? "bidder" : "conti_staff" } },
      })
    : null;

  const data = magic.error ? invited?.data : magic.data;
  const error = magic.error ? invited?.error : null;
  const actionLink = data?.properties?.action_link ?? "";
  if (!actionLink) {
    return { ok: false, reason: error?.message || magic.error?.message || "Supabase did not return a magic link." };
  }

  return { ok: true, actionLink, userId: data?.user?.id ?? null };
}
