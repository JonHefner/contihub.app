import { buildBidInviteEmail } from "@/lib/bid/invite-email";
import { bidFromMailbox } from "@/lib/bid/graph";
import { createMagicLink } from "@/lib/bid/magic-link";
import { requireUser } from "@/lib/suite/auth";
import { ensureStaffOrg } from "@/lib/suite/org";

export async function inviteTeammate(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    throw new Error("Enter a work email.");
  }

  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  if (org.persist === "supabase") {
    const existing = await supabase
      .from("org_members")
      .select("id, role")
      .eq("org_id", org.orgId)
      .ilike("email", normalized)
      .maybeSingle();

    if (existing.error) {
      throw new Error(existing.error.message);
    }

    if (!existing.data) {
      const inserted = await supabase.from("org_members").insert({
        org_id: org.orgId,
        email: normalized,
        role: "conti_staff",
      });
      if (inserted.error) {
        throw new Error(inserted.error.message);
      }
    } else if (existing.data.role !== "conti_staff") {
      const updated = await supabase.from("org_members").update({ role: "conti_staff" }).eq("id", existing.data.id);
      if (updated.error) {
        throw new Error(updated.error.message);
      }
    }
  }

  const link = await createMagicLink(normalized, "/app");
  const mailbox = bidFromMailbox();
  const draft = buildBidInviteEmail({
    projectName: "ContiHub",
    packageTitle: "Conti staff access",
    dueLabel: "",
    trade: "Conti staff",
    username: normalized,
    magicLink: link.ok ? link.actionLink : null,
    drawingsUrl: "",
    fromMailbox: mailbox,
    buildingConnectedSent: false,
    bidPath: "/app",
  });

  return {
    email: normalized,
    invitedBy: user.email ?? "",
    subject: "ContiHub access — Continental Construction of Ohio",
    text: [
      "You are invited to ContiHub as Conti staff.",
      `Username: ${normalized}`,
      link.ok ? `Magic link: ${link.actionLink}` : draft.text,
      "Staff share company projects. Bidder invitations stay limited to the packages they were sent.",
      mailbox ? `Send from: ${mailbox}` : "Send from your Conti mailbox.",
    ].join("\n"),
    html: draft.html,
    mailto: `mailto:${encodeURIComponent(normalized)}?subject=${encodeURIComponent("ContiHub access — Continental Construction of Ohio")}&body=${encodeURIComponent(
      link.ok
        ? `You are invited to ContiHub as Conti staff.\nUsername: ${normalized}\nMagic link: ${link.actionLink}\n`
        : `You are invited to ContiHub as Conti staff.\nUsername: ${normalized}\nOpen https://www.contihub.app/login after your magic link is configured.\n`,
    )}`,
    magicLink: link.ok ? link.actionLink : null,
    magicLinkError: link.ok ? null : link.reason,
    persist: org.persist,
  };
}
