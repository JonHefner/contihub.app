import { listContractors } from "@/lib/suite/bid-store";
import { isMissingRelation } from "@/lib/suite/db-error";
import { todayISO } from "@/lib/suite/form";
import { ensureStaffOrg, memoryOrgId } from "@/lib/suite/org";
import { requireUser } from "@/lib/suite/auth";
import { listFieldRfis, saveFieldRfi } from "@/lib/suite/store";
import type { ListResult, PersistMode } from "@/lib/suite/types";
import {
  DEFAULT_ROSTER,
  DEFAULT_TYPE_ROUTES,
  activeSeats,
  buildDistributeDraft,
  costPingNote,
  fieldStatusForPipeline,
  requireRole,
  rosterCorrection,
  routeBlockReason,
  routeRoleFromConfig,
  statusAfterSave,
  type RfiDistribution,
  type RfiDraft,
  type RfiIntent,
  type RfiItem,
  type RfiOutcome,
  type RfiRole,
  type RfiRosterSeat,
  type RfiStatus,
  type RfiTypeRoute,
} from "@/lib/rfi/pipeline";

type DbRow = Record<string, unknown>;

type MemoryBucket = {
  roster: RfiRosterSeat[];
  routes: RfiTypeRoute[];
  items: RfiItem[];
  outcomes: RfiOutcome[];
  distributions: RfiDistribution[];
};

const memory = new Map<string, MemoryBucket>();

function bucket(userId: string) {
  const existing = memory.get(userId);
  if (existing) {
    return existing;
  }
  const created: MemoryBucket = { roster: [], routes: [], items: [], outcomes: [], distributions: [] };
  memory.set(userId, created);
  return created;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown) {
  return value === true;
}

function asRole(value: unknown): RfiRole {
  const role = asString(value);
  return requireRole(role);
}

function asStatus(value: unknown): RfiStatus {
  const status = asString(value);
  if (
    status === "draft" ||
    status === "doc_review" ||
    status === "writing" ||
    status === "outcomes" ||
    status === "routed" ||
    status === "waiting" ||
    status === "closed" ||
    status === "complete"
  ) {
    return status;
  }
  return "draft";
}

function mapSeat(row: DbRow): RfiRosterSeat {
  return {
    id: asString(row.id),
    orgId: asString(row.org_id),
    projectId: asString(row.project_id),
    displayName: asString(row.display_name),
    email: asString(row.email),
    role: asRole(row.role),
    active: row.active !== false,
    notes: asString(row.notes),
  };
}

function mapRoute(row: DbRow): RfiTypeRoute {
  const target = asString(row.target_role);
  return {
    id: asString(row.id),
    rfiType: asString(row.rfi_type) === "owner_decision" ? "owner_decision" : "design_docs",
    label: asString(row.label),
    targetRole: target === "owner_liaison" ? "owner_liaison" : "architect_liaison",
    active: row.active !== false,
  };
}

function mapItem(row: DbRow): RfiItem {
  const urgency = asString(row.urgency, "normal");
  const rfiType = asString(row.rfi_type, "design_docs");
  const cost = asString(row.cost_impact, "unknown");
  const schedule = asString(row.schedule_impact, "unknown");
  const routeRole = asString(row.route_role);
  return {
    id: asString(row.id),
    orgId: asString(row.org_id),
    projectId: asString(row.project_id),
    number: asString(row.number),
    subject: asString(row.subject),
    question: asString(row.question),
    improvedQuestion: asString(row.improved_question),
    citations: asString(row.citations),
    docReviewNotes: asString(row.doc_review_notes),
    docsAlreadyAnswer: asBool(row.docs_already_answer),
    urgency: urgency === "low" || urgency === "high" || urgency === "critical" ? urgency : "normal",
    rfiType: rfiType === "owner_decision" ? "owner_decision" : "design_docs",
    routeRole:
      routeRole === "architect_liaison" ||
      routeRole === "owner_liaison" ||
      routeRole === "intake_reviewer" ||
      routeRole === "superintendent" ||
      routeRole === "distributor" ||
      routeRole === "admin"
        ? routeRole
        : "",
    fromName: asString(row.from_name),
    toName: asString(row.to_name),
    dateRequired: asString(row.date_required).slice(0, 10),
    costImpact: cost === "add" || cost === "deduct" || cost === "none" ? cost : "unknown",
    scheduleImpact: schedule === "yes" || schedule === "no" ? schedule : "unknown",
    status: asStatus(row.status),
    officialResponse: asString(row.official_response),
    returnedAt: asString(row.returned_at).slice(0, 10),
    teamsDocsUrl: asString(row.teams_docs_url),
    costPingNote: asString(row.cost_ping_note),
    loggedAt: asString(row.logged_at),
    distributedAt: asString(row.distributed_at),
    selectedOutcome: asString(row.selected_outcome),
    fieldRfiId: asString(row.field_rfi_id),
  };
}

function mapOutcome(row: DbRow): RfiOutcome {
  return {
    id: asString(row.id),
    rfiId: asString(row.rfi_id),
    label: asString(row.label),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : Number(row.sort_order ?? 0),
    selected: asBool(row.selected),
  };
}

function mapDistribution(row: DbRow): RfiDistribution {
  return {
    id: asString(row.id),
    rfiId: asString(row.rfi_id),
    recipientKind: asString(row.recipient_kind) === "subcontractor" ? "subcontractor" : "superintendent",
    name: asString(row.name),
    email: asString(row.email),
    contractorId: asString(row.contractor_id),
    rosterId: asString(row.roster_id),
    draftSubject: asString(row.draft_subject),
    draftBody: asString(row.draft_body),
    sentAt: asString(row.sent_at),
  };
}

function seedMemory(userId: string) {
  const rows = bucket(userId);
  const orgId = memoryOrgId(userId);
  if (rows.roster.length === 0) {
    rows.roster = DEFAULT_ROSTER.map((seat) => ({
      id: crypto.randomUUID(),
      orgId,
      projectId: "",
      displayName: seat.displayName,
      email: seat.email,
      role: seat.role,
      active: true,
      notes: seat.notes,
    }));
  }
  if (rows.routes.length === 0) {
    rows.routes = DEFAULT_TYPE_ROUTES.map((route) => ({
      id: crypto.randomUUID(),
      rfiType: route.rfiType,
      label: route.label,
      targetRole: route.targetRole,
      active: true,
    }));
  }
  return rows;
}

async function persistMode(): Promise<{ mode: PersistMode; orgId: string; userId: string }> {
  const org = await ensureStaffOrg();
  const { supabase, user } = await requireUser();
  if (org.persist === "memory") {
    return { mode: "memory", orgId: org.orgId, userId: user.id };
  }
  const probe = await supabase.from("rfi_items").select("id").limit(1);
  if (probe.error) {
    if (isMissingRelation(probe.error)) {
      return { mode: "memory", orgId: memoryOrgId(user.id), userId: user.id };
    }
    throw new Error(probe.error.message);
  }
  return { mode: "supabase", orgId: org.orgId, userId: user.id };
}

async function ensureSupabaseRoster(orgId: string, userId: string) {
  const { supabase } = await requireUser();
  const existing = await supabase.from("rfi_roster").select("id").eq("org_id", orgId).limit(1);
  if (existing.error) {
    throw new Error(existing.error.message);
  }
  if ((existing.data ?? []).length === 0) {
    const inserted = await supabase.from("rfi_roster").insert(
      DEFAULT_ROSTER.map((seat) => ({
        org_id: orgId,
        user_id: userId,
        display_name: seat.displayName,
        email: seat.email,
        role: seat.role,
        notes: seat.notes,
        active: true,
      })),
    );
    if (inserted.error && inserted.error.code !== "23505") {
      throw new Error(inserted.error.message);
    }
  }

  const routes = await supabase.from("rfi_type_routes").select("id").eq("org_id", orgId).limit(1);
  if (routes.error) {
    throw new Error(routes.error.message);
  }
  if ((routes.data ?? []).length > 0) {
    return;
  }
  const routeInsert = await supabase.from("rfi_type_routes").insert(
    DEFAULT_TYPE_ROUTES.map((route) => ({
      org_id: orgId,
      rfi_type: route.rfiType,
      label: route.label,
      target_role: route.targetRole,
      active: true,
    })),
  );
  if (routeInsert.error && routeInsert.error.code !== "23505") {
    throw new Error(routeInsert.error.message);
  }
}

async function reconcileRoster(ctx: { mode: PersistMode; orgId: string; userId: string }, seats: RfiRosterSeat[]) {
  const next = seats.map((seat) => {
    const fix = rosterCorrection(seat.role, seat.displayName, seat.email, seat.notes);
    if (!fix) {
      return seat;
    }
    return { ...seat, displayName: fix.displayName, email: fix.email, notes: fix.notes };
  });
  for (let index = 0; index < seats.length; index += 1) {
    const before = seats[index];
    const after = next[index];
    if (
      before.displayName === after.displayName &&
      before.email === after.email &&
      before.notes === after.notes
    ) {
      continue;
    }
    if (ctx.mode === "memory") {
      const row = seedMemory(ctx.userId).roster.find((seat) => seat.id === after.id);
      if (row) {
        row.displayName = after.displayName;
        row.email = after.email;
        row.notes = after.notes;
      }
      continue;
    }
    const { supabase } = await requireUser();
    const updated = await supabase
      .from("rfi_roster")
      .update({ display_name: after.displayName, email: after.email, notes: after.notes })
      .eq("id", after.id);
    if (updated.error) {
      throw new Error(updated.error.message);
    }
  }
  return next;
}

export async function listRoster(): Promise<ListResult<RfiRosterSeat>> {
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    const rows = await reconcileRoster(ctx, seedMemory(ctx.userId).roster.slice());
    return { persist: "memory", rows };
  }
  await ensureSupabaseRoster(ctx.orgId, ctx.userId);
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("rfi_roster")
    .select("*")
    .eq("org_id", ctx.orgId)
    .order("display_name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  const rows = await reconcileRoster(ctx, (data ?? []).map(mapSeat));
  return { persist: "supabase", rows };
}

export async function listTypeRoutes(): Promise<ListResult<RfiTypeRoute>> {
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    return { persist: "memory", rows: seedMemory(ctx.userId).routes.slice() };
  }
  await ensureSupabaseRoster(ctx.orgId, ctx.userId);
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("rfi_type_routes").select("*").eq("org_id", ctx.orgId);
  if (error) {
    throw new Error(error.message);
  }
  const rows = (data ?? []).map(mapRoute);
  return { persist: "supabase", rows: rows.length > 0 ? rows : DEFAULT_TYPE_ROUTES.map((route) => ({ ...route, id: route.rfiType, active: true })) };
}

export async function saveRosterSeat(
  input: { displayName: string; email: string; role: RfiRole; notes: string; projectId: string; active: boolean },
  id?: string,
) {
  const ctx = await persistMode();
  if (!input.displayName.trim()) {
    throw new Error("Name is required.");
  }
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId).roster;
    if (id) {
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) {
        throw new Error("Roster seat not found.");
      }
      rows[index] = { ...rows[index], ...input, displayName: input.displayName.trim(), email: input.email.trim() };
      return rows[index];
    }
    const created: RfiRosterSeat = {
      id: crypto.randomUUID(),
      orgId: ctx.orgId,
      projectId: input.projectId,
      displayName: input.displayName.trim(),
      email: input.email.trim(),
      role: input.role,
      active: input.active,
      notes: input.notes,
    };
    rows.unshift(created);
    return created;
  }

  const { supabase, user } = await requireUser();
  const payload = {
    org_id: ctx.orgId,
    project_id: input.projectId || null,
    display_name: input.displayName.trim(),
    email: input.email.trim(),
    role: input.role,
    notes: input.notes,
    active: input.active,
  };
  if (id) {
    const { data, error } = await supabase.from("rfi_roster").update(payload).eq("id", id).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapSeat(data);
  }
  const { data, error } = await supabase
    .from("rfi_roster")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapSeat(data);
}

export async function setRosterActive(id: string, active: boolean) {
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId).roster;
    const seat = rows.find((row) => row.id === id);
    if (!seat) {
      throw new Error("Roster seat not found.");
    }
    seat.active = active;
    return seat;
  }
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("rfi_roster").update({ active }).eq("id", id).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return mapSeat(data);
}

export async function listRfiItems(projectId?: string): Promise<ListResult<RfiItem>> {
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId).items.filter((row) => !projectId || row.projectId === projectId);
    return { persist: "memory", rows };
  }
  const { supabase } = await requireUser();
  let query = supabase.from("rfi_items").select("*").order("number", { ascending: true });
  if (projectId) {
    query = query.eq("project_id", projectId);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return { persist: "supabase", rows: (data ?? []).map(mapItem) };
}

export async function listRfiOutcomes(rfiId: string): Promise<RfiOutcome[]> {
  if (!rfiId) {
    return [];
  }
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    return seedMemory(ctx.userId)
      .outcomes.filter((row) => row.rfiId === rfiId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("rfi_outcomes")
    .select("*")
    .eq("rfi_id", rfiId)
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapOutcome);
}

export async function listRfiDistributions(rfiId: string): Promise<RfiDistribution[]> {
  if (!rfiId) {
    return [];
  }
  const ctx = await persistMode();
  if (ctx.mode === "memory") {
    return seedMemory(ctx.userId).distributions.filter((row) => row.rfiId === rfiId);
  }
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("rfi_distributions").select("*").eq("rfi_id", rfiId);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapDistribution);
}

function itemPayload(orgId: string, item: RfiItem) {
  return {
    org_id: orgId,
    project_id: item.projectId,
    number: item.number,
    subject: item.subject,
    question: item.question,
    improved_question: item.improvedQuestion,
    citations: item.citations,
    doc_review_notes: item.docReviewNotes,
    docs_already_answer: item.docsAlreadyAnswer,
    urgency: item.urgency,
    rfi_type: item.rfiType,
    route_role: item.routeRole,
    from_name: item.fromName,
    to_name: item.toName,
    date_required: item.dateRequired || null,
    cost_impact: item.costImpact,
    schedule_impact: item.scheduleImpact,
    status: item.status,
    official_response: item.officialResponse,
    returned_at: item.returnedAt || null,
    teams_docs_url: item.teamsDocsUrl,
    cost_ping_note: item.costPingNote,
    logged_at: item.loggedAt || null,
    distributed_at: item.distributedAt || null,
    selected_outcome: item.selectedOutcome,
    field_rfi_id: item.fieldRfiId || null,
  };
}

async function writeItem(ctx: { mode: PersistMode; orgId: string; userId: string }, item: RfiItem) {
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId).items;
    const index = rows.findIndex((row) => row.id === item.id);
    if (index === -1) {
      rows.unshift(item);
    } else {
      rows[index] = item;
    }
    return item;
  }
  const { supabase, user } = await requireUser();
  const payload = itemPayload(ctx.orgId, item);
  const existing = await supabase.from("rfi_items").select("id").eq("id", item.id).maybeSingle();
  if (existing.error) {
    throw new Error(existing.error.message);
  }
  if (existing.data) {
    const { data, error } = await supabase.from("rfi_items").update(payload).eq("id", item.id).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return mapItem(data);
  }
  const { data, error } = await supabase
    .from("rfi_items")
    .insert({ ...payload, id: item.id, user_id: user.id })
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapItem(data);
}

async function replaceOutcomes(ctx: { mode: PersistMode; userId: string }, rfiId: string, outcomes: RfiOutcome[]) {
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId);
    rows.outcomes = rows.outcomes.filter((row) => row.rfiId !== rfiId).concat(outcomes);
    return;
  }
  const { supabase } = await requireUser();
  const removed = await supabase.from("rfi_outcomes").delete().eq("rfi_id", rfiId);
  if (removed.error) {
    throw new Error(removed.error.message);
  }
  if (outcomes.length === 0) {
    return;
  }
  const inserted = await supabase.from("rfi_outcomes").insert(
    outcomes.map((outcome) => ({
      id: outcome.id,
      rfi_id: rfiId,
      label: outcome.label,
      sort_order: outcome.sortOrder,
      selected: outcome.selected,
    })),
  );
  if (inserted.error) {
    throw new Error(inserted.error.message);
  }
}

async function replaceDistributions(
  ctx: { mode: PersistMode; userId: string },
  rfiId: string,
  distributions: RfiDistribution[],
) {
  if (ctx.mode === "memory") {
    const rows = seedMemory(ctx.userId);
    rows.distributions = rows.distributions.filter((row) => row.rfiId !== rfiId).concat(distributions);
    return;
  }
  const { supabase } = await requireUser();
  const removed = await supabase.from("rfi_distributions").delete().eq("rfi_id", rfiId);
  if (removed.error) {
    throw new Error(removed.error.message);
  }
  if (distributions.length === 0) {
    return;
  }
  const inserted = await supabase.from("rfi_distributions").insert(
    distributions.map((row) => ({
      id: row.id,
      rfi_id: rfiId,
      recipient_kind: row.recipientKind,
      name: row.name,
      email: row.email,
      contractor_id: row.contractorId || null,
      roster_id: row.rosterId || null,
      draft_subject: row.draftSubject,
      draft_body: row.draftBody,
      sent_at: row.sentAt || null,
    })),
  );
  if (inserted.error) {
    throw new Error(inserted.error.message);
  }
}

async function syncField(item: RfiItem) {
  const existing = await listFieldRfis(item.projectId);
  const match = existing.rows.find((row) => row.id === item.fieldRfiId || row.number === item.number);
  const saved = await saveFieldRfi(
    {
      projectId: item.projectId,
      number: item.number,
      title: item.subject,
      description: [item.officialResponse, item.improvedQuestion || item.question].filter(Boolean).join("\n\n"),
      status: fieldStatusForPipeline(item.status),
      dueDate: item.dateRequired || todayISO(),
    },
    match?.id,
  );
  return saved.id;
}

export async function saveRfiDraft(draft: RfiDraft, intent: RfiIntent) {
  const ctx = await persistMode();
  const roster = ctx.mode === "memory" ? seedMemory(ctx.userId).roster : (await listRoster()).rows;
  const routes = ctx.mode === "memory" ? seedMemory(ctx.userId).routes : (await listTypeRoutes()).rows;
  const current =
    draft.id && ctx.mode === "memory"
      ? seedMemory(ctx.userId).items.find((row) => row.id === draft.id) ?? null
      : draft.id
        ? (await listRfiItems(draft.projectId)).rows.find((row) => row.id === draft.id) ?? null
        : null;

  if (draft.id && !current) {
    throw new Error("RFI not found.");
  }

  const outcomes = [0, 1, 2].map((index) => (draft.outcomes[index] ?? "").trim());
  const selectedOutcome = outcomes[draft.selectedIndex] ?? "";
  const routeRole = routeRoleFromConfig(draft.rfiType, routes);

  if (intent === "route") {
    const reason = routeBlockReason({
      docsAlreadyAnswer: draft.docsAlreadyAnswer,
      docReviewNotes: draft.docReviewNotes,
      citations: draft.citations,
      question: draft.question,
      improvedQuestion: draft.improvedQuestion,
      outcomes,
      selectedIndex: draft.selectedIndex,
      rfiType: draft.rfiType,
    });
    if (reason) {
      throw new Error(reason);
    }
    if (activeSeats(roster, routeRole, draft.projectId).length === 0) {
      throw new Error(
        routeRole === "owner_liaison"
          ? "No active owner liaison on the roster. Add that seat, then route again."
          : "No active architect liaison on the roster. Add that seat, then route again.",
      );
    }
  }

  if (intent === "close_docs" && !draft.docsAlreadyAnswer) {
    throw new Error("Mark that the documents already answer the question before closing with the drafter.");
  }

  if (intent === "return") {
    if (!draft.officialResponse.trim()) {
      throw new Error("Official response is required to log the return.");
    }
    if (draft.returnStatus !== "waiting" && draft.returnStatus !== "closed" && draft.returnStatus !== "complete") {
      throw new Error("Choose Waiting, Closed, or Complete.");
    }
  }

  const supers = activeSeats(roster, "superintendent", draft.projectId);
  const contractorRows = intent === "distribute" ? (await listContractors()).rows : [];
  const picked = contractorRows.filter((row) => (draft.contractorIds ?? []).includes(row.id));
  if (intent === "distribute") {
    if (!current || (current.status !== "waiting" && current.status !== "closed" && current.status !== "complete")) {
      throw new Error("Log the official response before pushing to the field and subcontractors.");
    }
    if (supers.length === 0 && picked.length === 0) {
      throw new Error("Activate a superintendent on the roster or choose a subcontractor.");
    }
  }

  const siblings = ctx.mode === "memory" ? seedMemory(ctx.userId).items : (await listRfiItems(draft.projectId)).rows;
  if (siblings.some((row) => row.number === draft.number && row.id !== draft.id)) {
    throw new Error(`${draft.number} is already on this project.`);
  }

  let status = statusAfterSave(current?.status ?? "draft", {
    docReviewNotes: draft.docReviewNotes,
    citations: draft.citations,
    improvedQuestion: draft.improvedQuestion,
    outcomes,
  });
  if (intent === "route") {
    status = "routed";
  }
  if (intent === "close_docs") {
    status = "closed";
  }
  if (intent === "return" && draft.returnStatus) {
    status = draft.returnStatus;
  }
  if (intent === "distribute" && current) {
    status = current.status;
  }

  const now = new Date().toISOString();
  const loggedAt =
    intent === "return" || intent === "close_docs" ? current?.loggedAt || now : current?.loggedAt || "";
  const official =
    intent === "close_docs"
      ? draft.officialResponse.trim() ||
        "Documents already answer this question. Closed with the drafter. Not issued."
      : draft.officialResponse;

  const item: RfiItem = {
    id: current?.id || crypto.randomUUID(),
    orgId: ctx.orgId,
    projectId: draft.projectId,
    number: draft.number,
    subject: draft.subject,
    question: draft.question,
    improvedQuestion: draft.improvedQuestion,
    citations: draft.citations,
    docReviewNotes: draft.docReviewNotes,
    docsAlreadyAnswer: draft.docsAlreadyAnswer,
    urgency: draft.urgency,
    rfiType: draft.rfiType,
    routeRole,
    fromName: draft.fromName,
    toName: draft.toName,
    dateRequired: draft.dateRequired,
    costImpact: draft.costImpact,
    scheduleImpact: draft.scheduleImpact,
    status,
    officialResponse: official,
    returnedAt:
      intent === "return" || intent === "close_docs" ? draft.returnedAt || todayISO() : current?.returnedAt || draft.returnedAt,
    teamsDocsUrl: draft.teamsDocsUrl,
    costPingNote: costPingNote(draft.costImpact),
    loggedAt,
    distributedAt: current?.distributedAt || "",
    selectedOutcome,
    fieldRfiId: current?.fieldRfiId || "",
  };

  if (intent === "route" && !item.toName) {
    const liaison = activeSeats(roster, routeRole, draft.projectId)[0];
    item.toName = liaison?.displayName ?? "";
  }

  let saved = await writeItem(ctx, item);
  const outcomeRows: RfiOutcome[] = outcomes
    .map((label, index) => ({ label, index }))
    .filter((row) => row.label)
    .map((row) => ({
      id: crypto.randomUUID(),
      rfiId: saved.id,
      label: row.label,
      sortOrder: row.index,
      selected: row.index === draft.selectedIndex,
    }));
  await replaceOutcomes(ctx, saved.id, outcomeRows);

  let distributions: RfiDistribution[] = [];
  if (intent === "distribute") {
    const core = buildDistributeDraft({
      number: saved.number,
      subject: saved.subject,
      urgency: saved.urgency,
      question: saved.improvedQuestion || saved.question,
      officialResponse: saved.officialResponse,
      selectedOutcome: saved.selectedOutcome,
    });
    distributions = [
      ...supers.map((seat) => ({
        id: crypto.randomUUID(),
        rfiId: saved.id,
        recipientKind: "superintendent" as const,
        name: seat.displayName,
        email: seat.email,
        contractorId: "",
        rosterId: seat.id,
        draftSubject: core.subject,
        draftBody: `To: ${seat.displayName}${seat.email ? ` <${seat.email}>` : " (email TBD)"}\n\n${core.body}`,
        sentAt: "",
      })),
      ...picked.map((contractor) => ({
        id: crypto.randomUUID(),
        rfiId: saved.id,
        recipientKind: "subcontractor" as const,
        name: contractor.name || contractor.company,
        email: contractor.email,
        contractorId: contractor.id,
        rosterId: "",
        draftSubject: core.subject,
        draftBody: `To: ${contractor.name || contractor.company}${contractor.email ? ` <${contractor.email}>` : ""}\n\n${core.body}`,
        sentAt: "",
      })),
    ];
    saved = {
      ...saved,
      fieldRfiId: await syncField(saved),
      distributedAt: now,
    };
    saved = await writeItem(ctx, saved);
    await replaceDistributions(ctx, saved.id, distributions);
  } else if (intent === "return" || intent === "close_docs") {
    saved = { ...saved, fieldRfiId: await syncField(saved) };
    saved = await writeItem(ctx, saved);
  }

  return { item: saved, outcomes: outcomeRows, distributions };
}
