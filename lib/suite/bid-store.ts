import { contractorName, type ContractorCsvRow } from "@/lib/bid/csv";
import { isMissingRelation } from "@/lib/suite/db-error";
import { ensureStaffOrg, memoryOrgId } from "@/lib/suite/org";
import { requireUser } from "@/lib/suite/auth";
import type {
  BidContractor,
  BidInvitee,
  BidInviteeStatus,
  BidPackage,
  ContractorSource,
  ListResult,
  PersistMode,
} from "@/lib/suite/types";

type DbRow = Record<string, unknown>;

type MemoryBucket = {
  contractors: BidContractor[];
  packages: BidPackage[];
  invitees: BidInvitee[];
};

const memory = new Map<string, MemoryBucket>();

function bucket(userId: string) {
  const existing = memory.get(userId);
  if (existing) {
    return existing;
  }
  const created = { contractors: [], packages: [], invitees: [] };
  memory.set(userId, created);
  return created;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown) {
  return value === true;
}

function asSource(value: unknown): ContractorSource {
  return value === "import" ? "import" : "manual";
}

function asStatus(value: unknown): BidInviteeStatus {
  if (value === "invited" || value === "opened" || value === "declined" || value === "draft") {
    return value;
  }
  return "draft";
}

function mapContractor(row: DbRow): BidContractor {
  const firstName = asString(row.first_name);
  const lastName = asString(row.last_name);
  const company = asString(row.company);
  return {
    id: asString(row.id),
    orgId: asString(row.org_id),
    firstName,
    lastName,
    name: asString(row.name) || contractorName(firstName, lastName, company),
    email: asString(row.email).toLowerCase(),
    company,
    phone: asString(row.phone),
    office: asString(row.office),
    cell: asString(row.cell),
    street: asString(row.street),
    city: asString(row.city),
    state: asString(row.state),
    zip: asString(row.zip),
    categories: asString(row.categories),
    notes: asString(row.notes),
    source: asSource(row.source),
  };
}

function mapPackage(row: DbRow): BidPackage {
  return {
    id: asString(row.id),
    orgId: asString(row.org_id),
    projectId: asString(row.project_id),
    projectName: asString(row.project_name),
    title: asString(row.title),
    dueAt: asString(row.due_at),
    drawingsTeamsUrl: asString(row.drawings_teams_url),
    notes: asString(row.notes),
    buildingConnectedSent: asBool(row.building_connected_sent),
  };
}

function mapInvitee(row: DbRow): BidInvitee {
  return {
    id: asString(row.id),
    packageId: asString(row.package_id),
    contractorId: asString(row.contractor_id),
    userId: asString(row.user_id),
    email: asString(row.email).toLowerCase(),
    name: asString(row.name),
    company: asString(row.company),
    trade: asString(row.trade),
    status: asStatus(row.status),
    invitedAt: asString(row.invited_at),
    magicLinkSentAt: asString(row.magic_link_sent_at),
  };
}

function contractorPayload(orgId: string, input: Omit<BidContractor, "id" | "orgId" | "name">) {
  return {
    org_id: orgId,
    first_name: input.firstName,
    last_name: input.lastName,
    name: contractorName(input.firstName, input.lastName, input.company),
    email: input.email.toLowerCase(),
    company: input.company,
    phone: input.phone,
    office: input.office,
    cell: input.cell,
    street: input.street,
    city: input.city,
    state: input.state,
    zip: input.zip,
    categories: input.categories,
    notes: input.notes,
    source: input.source,
  };
}

export async function listContractors(): Promise<ListResult<BidContractor>> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("bid_contractors").select("*").order("company", { ascending: true });
  if (!error) {
    return { persist: "supabase", rows: (data ?? []).map(mapContractor) };
  }
  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }
  const rows = bucket(user.id).contractors.slice().sort((a, b) => a.company.localeCompare(b.company));
  return { persist: "memory", rows };
}

export async function saveContractor(input: Omit<BidContractor, "id" | "orgId" | "name">, id?: string) {
  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  const payload = contractorPayload(org.orgId, input);

  if (org.persist === "memory") {
    const rows = bucket(user.id).contractors;
    if (id) {
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        throw new Error("Contractor not found");
      }
      rows[index] = { ...rows[index], ...input, name: payload.name, orgId: org.orgId, email: payload.email };
      return rows[index];
    }
    const created: BidContractor = {
      ...input,
      id: crypto.randomUUID(),
      orgId: org.orgId,
      name: payload.name,
      email: payload.email,
    };
    rows.unshift(created);
    return created;
  }

  if (id) {
    const { data, error } = await supabase.from("bid_contractors").update(payload).eq("id", id).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapContractor(data);
  }

  const { data, error } = await supabase
    .from("bid_contractors")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapContractor(data);
}

export async function deleteContractor(id: string) {
  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  if (org.persist === "memory") {
    const store = bucket(user.id);
    store.contractors = store.contractors.filter((row) => row.id !== id);
    return;
  }
  const { error } = await supabase.from("bid_contractors").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function importContractors(rows: ContractorCsvRow[]) {
  const existing = await listContractors();
  const byEmail = new Map(existing.rows.filter((row) => row.email).map((row) => [row.email, row.id]));
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const email = row.email.toLowerCase();
    const existingId = email ? byEmail.get(email) : undefined;
    const saved = await saveContractor(
      {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        company: row.company,
        phone: row.phone,
        office: row.office,
        cell: row.cell,
        street: row.street,
        city: row.city,
        state: row.state,
        zip: row.zip,
        categories: row.categories,
        notes: row.notes,
        source: "import",
      },
      existingId,
    );
    if (saved.email) {
      byEmail.set(saved.email, saved.id);
    }
    if (existingId) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return { created, updated, persist: existing.persist };
}

export async function listPackages(projectId?: string): Promise<ListResult<BidPackage>> {
  const { supabase, user } = await requireUser();
  let query = supabase.from("bid_packages").select("*").order("due_at", { ascending: true });
  if (projectId) {
    query = query.eq("project_id", projectId);
  }
  const { data, error } = await query;
  if (!error) {
    return { persist: "supabase", rows: (data ?? []).map(mapPackage) };
  }
  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }
  const rows = bucket(user.id).packages.filter((row) => !projectId || row.projectId === projectId);
  return { persist: "memory", rows };
}

export async function savePackage(
  input: Omit<BidPackage, "id" | "orgId">,
  id?: string,
): Promise<{ row: BidPackage; persist: PersistMode }> {
  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  const payload = {
    org_id: org.orgId,
    project_id: input.projectId,
    project_name: input.projectName,
    title: input.title,
    due_at: input.dueAt || null,
    drawings_teams_url: input.drawingsTeamsUrl,
    notes: input.notes,
    building_connected_sent: input.buildingConnectedSent,
  };

  if (org.persist === "memory") {
    const rows = bucket(user.id).packages;
    if (id) {
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        throw new Error("Bid package not found");
      }
      rows[index] = { ...input, id, orgId: org.orgId };
      return { row: rows[index], persist: "memory" };
    }
    const created: BidPackage = { ...input, id: crypto.randomUUID(), orgId: org.orgId };
    rows.unshift(created);
    return { row: created, persist: "memory" };
  }

  if (id) {
    const { data, error } = await supabase.from("bid_packages").update(payload).eq("id", id).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return { row: mapPackage(data), persist: "supabase" };
  }

  const { data, error } = await supabase
    .from("bid_packages")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return { row: mapPackage(data), persist: "supabase" };
}

export async function deletePackage(id: string) {
  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  if (org.persist === "memory") {
    const store = bucket(user.id);
    store.packages = store.packages.filter((row) => row.id !== id);
    store.invitees = store.invitees.filter((row) => row.packageId !== id);
    return;
  }
  const { error } = await supabase.from("bid_packages").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listInvitees(packageId?: string): Promise<ListResult<BidInvitee>> {
  const { supabase, user } = await requireUser();
  let query = supabase.from("bid_invitees").select("*").order("company", { ascending: true });
  if (packageId) {
    query = query.eq("package_id", packageId);
  }
  const { data, error } = await query;
  if (!error) {
    return { persist: "supabase", rows: (data ?? []).map(mapInvitee) };
  }
  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }
  const rows = bucket(user.id).invitees.filter((row) => !packageId || row.packageId === packageId);
  return { persist: "memory", rows };
}

export async function saveInvitee(
  input: Omit<BidInvitee, "id">,
  id?: string,
  persistHint?: PersistMode,
): Promise<BidInvitee> {
  const { supabase, user } = await requireUser();
  const useMemory = persistHint === "memory" || (await ensureStaffOrg()).persist === "memory";
  const payload = {
    package_id: input.packageId,
    contractor_id: input.contractorId || null,
    user_id: input.userId || null,
    email: input.email.toLowerCase(),
    name: input.name,
    company: input.company,
    trade: input.trade,
    status: input.status,
    invited_at: input.invitedAt || null,
    magic_link_sent_at: input.magicLinkSentAt || null,
  };

  if (useMemory) {
    const rows = bucket(user.id).invitees;
    if (id) {
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        throw new Error("Invitee not found");
      }
      rows[index] = { ...input, id, email: payload.email };
      return rows[index];
    }
    const created: BidInvitee = { ...input, id: crypto.randomUUID(), email: payload.email };
    rows.unshift(created);
    return created;
  }

  if (id) {
    const { data, error } = await supabase.from("bid_invitees").update(payload).eq("id", id).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapInvitee(data);
  }

  const { data, error } = await supabase.from("bid_invitees").insert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return mapInvitee(data);
}

export type BidderPackageView = BidPackage & {
  trade: string;
  status: BidInviteeStatus;
  inviteeId: string;
};

export async function listMyInvitations(): Promise<ListResult<BidderPackageView>> {
  const { supabase, user } = await requireUser();
  const email = (user.email ?? "").toLowerCase();
  const { data, error } = await supabase.from("bid_invitees").select("*, bid_packages(*)").order("invited_at", {
    ascending: false,
  });

  if (!error) {
    const rows = (data ?? []).map((row) => {
      const invitee = mapInvitee(row);
      const nestedRaw = row.bid_packages;
      const nested = ((Array.isArray(nestedRaw) ? nestedRaw[0] : nestedRaw) ?? {}) as DbRow;
      const pkg = mapPackage({ ...nested, id: nested.id ?? invitee.packageId });
      return { ...pkg, trade: invitee.trade, status: invitee.status, inviteeId: invitee.id };
    });
    return { persist: "supabase", rows };
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  const store = bucket(user.id);
  const rows = store.invitees
    .filter((invitee) => invitee.email === email || invitee.userId === user.id)
    .map((invitee) => {
      const pkg = store.packages.find((item) => item.id === invitee.packageId);
      return {
        id: pkg?.id ?? invitee.packageId,
        orgId: pkg?.orgId ?? memoryOrgId(user.id),
        projectId: pkg?.projectId ?? "",
        projectName: pkg?.projectName ?? "",
        title: pkg?.title ?? "Bid package",
        dueAt: pkg?.dueAt ?? "",
        drawingsTeamsUrl: pkg?.drawingsTeamsUrl ?? "",
        notes: pkg?.notes ?? "",
        buildingConnectedSent: pkg?.buildingConnectedSent ?? false,
        trade: invitee.trade,
        status: invitee.status,
        inviteeId: invitee.id,
      };
    });
  return { persist: "memory", rows };
}
