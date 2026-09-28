import { buildBidInviteEmail } from "@/lib/bid/invite-email";
import { bidFromMailbox, sendMailViaGraph } from "@/lib/bid/graph";
import { createMagicLink } from "@/lib/bid/magic-link";
import { formatDate } from "@/lib/suite/form";
import { listContractors, listInvitees, listPackages, saveInvitee, savePackage } from "@/lib/suite/bid-store";
import { ensureStaffOrg } from "@/lib/suite/org";

export type InviteDraft = {
  inviteeId: string;
  email: string;
  name: string;
  trade: string;
  subject: string;
  text: string;
  html: string;
  mailto: string;
  magicLink: string | null;
  magicLinkError: string | null;
};

function dueLabel(value: string) {
  if (!value) {
    return "";
  }
  const date = value.slice(0, 10);
  const time = value.length > 10 ? value.slice(11, 16) : "";
  return time ? `${formatDate(date)} ${time}` : formatDate(date);
}

export async function issuePackageInvites(input: {
  packageId: string;
  contractorIds: string[];
  trade: string;
  buildingConnectedSent: boolean;
}) {
  const org = await ensureStaffOrg();
  const packages = await listPackages();
  const bidPackage = packages.rows.find((row) => row.id === input.packageId);
  if (!bidPackage) {
    throw new Error("Bid package not found.");
  }

  await savePackage(
    {
      ...bidPackage,
      buildingConnectedSent: input.buildingConnectedSent,
    },
    bidPackage.id,
  );

  const directory = await listContractors();
  const chosen = directory.rows.filter((row) => input.contractorIds.includes(row.id));
  if (chosen.length === 0) {
    throw new Error("Pick at least one contractor.");
  }
  if (chosen.some((row) => !row.email)) {
    throw new Error("Every invited contractor needs an email address.");
  }

  const existing = await listInvitees(bidPackage.id);
  const drafts: InviteDraft[] = [];
  const fromMailbox = bidFromMailbox();

  for (const contractor of chosen) {
    const prior = existing.rows.find((row) => row.email === contractor.email);
    const link = await createMagicLink(contractor.email, "/app/bid/invitations");
    const sentAt = link.ok ? new Date().toISOString() : prior?.magicLinkSentAt ?? "";
    const invitee = await saveInvitee(
      {
        packageId: bidPackage.id,
        contractorId: contractor.id,
        userId: link.ok ? link.userId ?? prior?.userId ?? "" : prior?.userId ?? "",
        email: contractor.email,
        name: contractor.name,
        company: contractor.company,
        trade: input.trade,
        status: "invited",
        invitedAt: new Date().toISOString(),
        magicLinkSentAt: sentAt,
      },
      prior?.id,
      org.persist,
    );

    if (link.ok && link.userId) {
      await grantBidder(org.orgId, contractor.email, link.userId, org.persist);
    } else {
      await grantBidder(org.orgId, contractor.email, "", org.persist);
    }

    const email = buildBidInviteEmail({
      projectName: bidPackage.projectName,
      packageTitle: bidPackage.title,
      dueLabel: dueLabel(bidPackage.dueAt),
      trade: input.trade,
      username: contractor.email,
      magicLink: link.ok ? link.actionLink : null,
      drawingsUrl: bidPackage.drawingsTeamsUrl,
      fromMailbox,
      buildingConnectedSent: input.buildingConnectedSent,
    });

    drafts.push({
      inviteeId: invitee.id,
      email: contractor.email,
      name: contractor.name,
      trade: input.trade,
      subject: email.subject,
      text: email.text,
      html: email.html,
      mailto: email.mailto,
      magicLink: link.ok ? link.actionLink : null,
      magicLinkError: link.ok ? null : link.reason,
    });
  }

  return { drafts, persist: org.persist };
}

export async function sendInviteeViaGraph(inviteeId: string) {
  const org = await ensureStaffOrg();
  const invitees = await listInvitees();
  const invitee = invitees.rows.find((row) => row.id === inviteeId);
  if (!invitee) {
    throw new Error("Invitee not found.");
  }
  const packages = await listPackages();
  const bidPackage = packages.rows.find((row) => row.id === invitee.packageId);
  if (!bidPackage) {
    throw new Error("Bid package not found.");
  }

  const link = await createMagicLink(invitee.email, "/app/bid/invitations");
  const email = buildBidInviteEmail({
    projectName: bidPackage.projectName,
    packageTitle: bidPackage.title,
    dueLabel: dueLabel(bidPackage.dueAt),
    trade: invitee.trade,
    username: invitee.email,
    magicLink: link.ok ? link.actionLink : null,
    drawingsUrl: bidPackage.drawingsTeamsUrl,
    fromMailbox: bidFromMailbox(),
    buildingConnectedSent: bidPackage.buildingConnectedSent,
  });
  const sent = await sendMailViaGraph({ to: invitee.email, subject: email.subject, html: email.html });
  if (!sent.ok) {
    return sent;
  }

  await saveInvitee(
    {
      ...invitee,
      status: "invited",
      magicLinkSentAt: new Date().toISOString(),
      userId: link.ok ? link.userId ?? invitee.userId : invitee.userId,
    },
    invitee.id,
    org.persist,
  );
  return { ok: true as const, status: 202, missing: [] as string[] };
}

async function grantBidder(orgId: string, email: string, userId: string, persist: "supabase" | "memory") {
  if (persist === "memory" || orgId.startsWith("memory-org:")) {
    return;
  }
  const { requireUser } = await import("@/lib/suite/auth");
  const { supabase } = await requireUser();
  const found = await supabase
    .from("org_members")
    .select("id, role")
    .eq("org_id", orgId)
    .ilike("email", email)
    .maybeSingle();

  if (found.error) {
    return;
  }
  if (found.data?.role === "conti_staff") {
    return;
  }
  if (found.data?.id) {
    const updated = await supabase
      .from("org_members")
      .update({ role: "bidder", ...(userId ? { user_id: userId } : {}) })
      .eq("id", found.data.id);
    if (updated.error) {
      throw new Error(updated.error.message);
    }
    return;
  }

  const inserted = await supabase.from("org_members").insert({
    org_id: orgId,
    user_id: userId || null,
    email,
    role: "bidder",
  });
  if (inserted.error) {
    throw new Error(inserted.error.message);
  }
}
