import { redirect } from "next/navigation";
import { isMissingRelation } from "@/lib/suite/db-error";
import { requireUser } from "@/lib/suite/auth";
import type { PersistMode } from "@/lib/suite/types";

export type AccessKind = "staff" | "bidder";

export type AccessContext = {
  kind: AccessKind;
  orgIds: string[];
  persist: PersistMode;
  email: string;
  userId: string;
};

const memoryOrgs = new Map<string, string>();

export function memoryOrgId(userId: string) {
  return `memory-org:${userId}`;
}

function rememberOrg(userId: string) {
  const existing = memoryOrgs.get(userId);
  if (existing) {
    return existing;
  }
  const id = memoryOrgId(userId);
  memoryOrgs.set(userId, id);
  return id;
}

export async function claimAccess() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("claim_my_access");
  if (error && !isMissingRelation(error)) {
    throw new Error(error.message);
  }
}

export async function resolveAccess(): Promise<AccessContext> {
  const { supabase, user } = await requireUser();
  const email = (user.email ?? "").toLowerCase();
  await claimAccess();

  const members = await supabase.from("org_members").select("org_id, role, user_id, email");
  if (members.error) {
    if (!isMissingRelation(members.error)) {
      throw new Error(members.error.message);
    }
    return { kind: "staff", orgIds: [], persist: "memory", email, userId: user.id };
  }

  const mine = (members.data ?? []).filter((row) => {
    const rowEmail = String(row.email ?? "").toLowerCase();
    return row.user_id === user.id || (rowEmail && rowEmail === email);
  });
  const staffOrgIds = mine.filter((row) => row.role === "conti_staff").map((row) => String(row.org_id));
  if (staffOrgIds.length > 0) {
    return { kind: "staff", orgIds: staffOrgIds, persist: "supabase", email, userId: user.id };
  }

  const bidderOrgIds = mine.filter((row) => row.role === "bidder").map((row) => String(row.org_id));
  if (bidderOrgIds.length > 0) {
    return { kind: "bidder", orgIds: bidderOrgIds, persist: "supabase", email, userId: user.id };
  }

  const [invitees, projects] = await Promise.all([
    supabase.from("bid_invitees").select("id").limit(1),
    supabase.from("projects").select("id").limit(1),
  ]);

  const invited = !invitees.error && (invitees.data?.length ?? 0) > 0;
  const ownsProject = !projects.error && (projects.data?.length ?? 0) > 0;
  if (invited && !ownsProject) {
    return { kind: "bidder", orgIds: [], persist: "supabase", email, userId: user.id };
  }

  return { kind: "staff", orgIds: [], persist: "supabase", email, userId: user.id };
}

export async function requireStaff() {
  const access = await resolveAccess();
  if (access.kind === "bidder") {
    redirect("/app/bid/invitations");
  }
  return access;
}

export async function ensureStaffOrg() {
  const { supabase, user } = await requireUser();
  const email = (user.email ?? "").toLowerCase();
  const access = await resolveAccess();
  if (access.kind === "bidder") {
    redirect("/app/bid/invitations");
  }
  if (access.persist === "memory") {
    return { orgId: rememberOrg(user.id), persist: "memory" as const };
  }
  if (access.orgIds.length > 0) {
    const preferred = await preferOrg(access.orgIds);
    return { orgId: preferred, persist: "supabase" as const };
  }

  const created = await supabase
    .from("orgs")
    .insert({ name: "Continental Construction of Ohio", created_by: user.id })
    .select("id")
    .single();

  if (created.error || !created.data) {
    if (created.error && isMissingRelation(created.error)) {
      return { orgId: rememberOrg(user.id), persist: "memory" as const };
    }
    throw new Error(created.error?.message ?? "Could not create the Conti organization.");
  }

  const member = await supabase.from("org_members").insert({
    org_id: created.data.id,
    user_id: user.id,
    email,
    role: "conti_staff",
  });

  if (member.error) {
    throw new Error(member.error.message);
  }

  const orgId = String(created.data.id);
  await supabase.from("projects").update({ org_id: orgId }).eq("user_id", user.id).is("org_id", null);
  return { orgId, persist: "supabase" as const };
}

async function preferOrg(orgIds: string[]) {
  const { supabase } = await requireUser();
  const projects = await supabase.from("projects").select("org_id");
  if (projects.error || !projects.data) {
    return orgIds[0];
  }
  const counts = new Map<string, number>();
  for (const row of projects.data) {
    const orgId = String(row.org_id ?? "");
    if (!orgIds.includes(orgId)) {
      continue;
    }
    counts.set(orgId, (counts.get(orgId) ?? 0) + 1);
  }
  return [...orgIds].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0] ?? orgIds[0];
}

export async function markInvitesOpened() {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("mark_my_invites_opened");
  if (error && !isMissingRelation(error)) {
    throw new Error(error.message);
  }
}
