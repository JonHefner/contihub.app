import type {
  BidChase,
  CostJob,
  CrmLead,
  FieldJob,
  FieldLogStatus,
  FieldReport,
  FieldRfi,
  FieldRfiStatus,
  ListResult,
  PersistMode,
  Project,
  ProjectStatus,
  SafetyLog,
  SuiteTable,
  TrakMilestone,
} from "@/lib/suite/types";
import { isValidProjectStatus } from "@/lib/projects";
import { requireUser } from "@/lib/suite/auth";

type DbRow = Record<string, unknown>;

type MemoryRow = DbRow & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const memory = new Map<string, MemoryRow[]>();

function memoryKey(table: SuiteTable, userId: string) {
  return `${table}:${userId}`;
}

function getMemory(table: SuiteTable, userId: string) {
  const key = memoryKey(table, userId);
  if (!memory.has(key)) {
    memory.set(key, []);
  }
  return memory.get(key)!;
}

function isMissingRelation(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("does not exist") ||
    message.includes("could not find the table") ||
    message.includes("schema cache")
  );
}

function nowIso() {
  return new Date().toISOString();
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asDate(value: unknown) {
  if (typeof value === "string" && value) {
    return value.slice(0, 10);
  }
  return "";
}

function asProjectId(value: unknown) {
  return asString(value);
}

function asProjectStatus(value: unknown): ProjectStatus {
  return isValidProjectStatus(asString(value)) ? (value as ProjectStatus) : "Active";
}

function mapProject(row: DbRow): Project {
  return {
    id: asString(row.id),
    name: asString(row.name),
    jobNumber: asString(row.job_number),
    address: asString(row.address),
    status: asProjectStatus(row.status),
    createdBy: asString(row.created_by),
  };
}

function mapCrm(row: DbRow): CrmLead {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    name: asString(row.name),
    company: asString(row.company),
    stage: asString(row.stage),
    notes: asString(row.notes),
  };
}

function asLogStatus(value: unknown): FieldLogStatus {
  return value === "final" ? "final" : "draft";
}

function asRfiStatus(value: unknown): FieldRfiStatus {
  return value === "closed" ? "closed" : "open";
}

function mapField(row: DbRow): FieldReport {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    date: asDate(row.report_date),
    jobName: asString(row.job_name),
    weather: asString(row.weather),
    weatherPm: asString(row.weather_pm),
    tempLow: asString(row.temp_low),
    tempHigh: asString(row.temp_high),
    precip: asString(row.precip),
    wind: asString(row.wind),
    ground: asString(row.ground, "Dry"),
    notes: asString(row.notes),
    crewCount: asNumber(row.crew_count),
    manHours: asNumber(row.man_hours),
    workPerformed: asString(row.work_performed),
    delays: asString(row.delays),
    materials: asString(row.materials),
    visitors: asString(row.visitors),
    preparedBy: asString(row.prepared_by),
    preparedTitle: asString(row.prepared_title),
    shiftStart: asString(row.shift_start),
    shiftEnd: asString(row.shift_end),
    status: asLogStatus(row.status),
  };
}

function mapFieldJob(row: DbRow): FieldJob {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    companyName: asString(row.company_name),
    jobTitle: asString(row.job_title),
    jobNumber: asString(row.job_number),
    address: asString(row.address),
    client: asString(row.client),
    superintendent: asString(row.superintendent),
  };
}

function mapFieldRfi(row: DbRow): FieldRfi {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    number: asString(row.number),
    title: asString(row.title),
    description: asString(row.description),
    status: asRfiStatus(row.status),
    dueDate: asDate(row.due_date),
  };
}

function fieldReportValues(input: Omit<FieldReport, "id">): DbRow {
  return {
    project_id: input.projectId || null,
    report_date: input.date,
    job_name: input.jobName,
    weather: input.weather,
    weather_pm: input.weatherPm,
    temp_low: input.tempLow,
    temp_high: input.tempHigh,
    precip: input.precip,
    wind: input.wind,
    ground: input.ground,
    notes: input.notes,
    crew_count: input.crewCount,
    man_hours: input.manHours,
    work_performed: input.workPerformed,
    delays: input.delays,
    materials: input.materials,
    visitors: input.visitors,
    prepared_by: input.preparedBy,
    prepared_title: input.preparedTitle,
    shift_start: input.shiftStart,
    shift_end: input.shiftEnd,
    status: input.status,
  };
}

function mapCost(row: DbRow): CostJob {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    job: asString(row.job),
    budget: asNumber(row.budget),
    committed: asNumber(row.committed),
    actual: asNumber(row.actual),
  };
}

function mapSafety(row: DbRow): SafetyLog {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    type: asString(row.entry_type),
    date: asDate(row.entry_date),
    location: asString(row.location),
    notes: asString(row.notes),
  };
}

function mapTrak(row: DbRow): TrakMilestone {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    activity: asString(row.activity),
    start: asDate(row.start_date),
    finish: asDate(row.finish_date),
    percentComplete: asNumber(row.percent_complete),
  };
}

function mapBid(row: DbRow): BidChase {
  return {
    id: asString(row.id),
    projectId: asProjectId(row.project_id),
    project: asString(row.project),
    dueDate: asDate(row.due_date),
    status: asString(row.status),
    estimateValue: asNumber(row.estimate_value),
  };
}

function scopedRows(rows: DbRow[], projectId?: string) {
  if (!projectId) {
    return rows;
  }
  return rows.filter((row) => asProjectId(row.project_id) === projectId);
}

async function queryRows(
  table: SuiteTable,
  options: { orderBy?: string; ascending?: boolean; projectId?: string } = {},
): Promise<{ rows: DbRow[]; persist: PersistMode }> {
  const { supabase, user } = await requireUser();
  let query = supabase.from(table).select("*").eq("user_id", user.id);
  if (options.projectId) {
    query = query.eq("project_id", options.projectId);
  }

  const { data, error } = await query.order(options.orderBy ?? "created_at", {
    ascending: options.ascending ?? false,
  });

  if (!error) {
    return { rows: data ?? [], persist: "supabase" };
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  if (options.projectId) {
    const unscoped = await supabase
      .from(table)
      .select("*")
      .eq("user_id", user.id)
      .order(options.orderBy ?? "created_at", { ascending: options.ascending ?? false });

    if (!unscoped.error) {
      return { rows: scopedRows(unscoped.data ?? [], options.projectId), persist: "supabase" };
    }

    if (unscoped.error && !isMissingRelation(unscoped.error)) {
      throw new Error(unscoped.error.message);
    }
  }

  return { rows: scopedRows(getMemory(table, user.id), options.projectId), persist: "memory" };
}

async function writeRow(
  table: SuiteTable,
  values: DbRow,
  id?: string,
): Promise<{ row: DbRow; persist: PersistMode }> {
  const { supabase, user } = await requireUser();
  const stamp = nowIso();

  if (id) {
    const { data, error } = await supabase
      .from(table)
      .update({ ...values, updated_at: stamp })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (!error && data) {
      return { row: data, persist: "supabase" };
    }

    if (error && !isMissingRelation(error)) {
      throw new Error(error.message);
    }

    const rows = getMemory(table, user.id);
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) {
      throw new Error("Record not found");
    }
    rows[index] = { ...rows[index], ...values, updated_at: stamp };
    return { row: rows[index], persist: "memory" };
  }

  const payload = {
    ...values,
    user_id: user.id,
    updated_at: stamp,
  };

  const { data, error } = await supabase.from(table).insert(payload).select("*").single();

  if (!error && data) {
    return { row: data, persist: "supabase" };
  }

  if (error && !isMissingRelation(error)) {
    throw new Error(error.message);
  }

  const created: MemoryRow = {
    ...payload,
    id: crypto.randomUUID(),
    created_at: stamp,
  };
  getMemory(table, user.id).unshift(created);
  return { row: created, persist: "memory" };
}

async function removeRow(table: SuiteTable, id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", user.id);

  if (!error) {
    return;
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  const rows = getMemory(table, user.id);
  const next = rows.filter((row) => row.id !== id);
  memory.set(memoryKey(table, user.id), next);
}

export async function listProjects(): Promise<ListResult<Project>> {
  const result = await queryRows("projects", { orderBy: "created_at", ascending: false });
  return { persist: result.persist, rows: result.rows.map(mapProject) };
}

export async function getProject(id: string): Promise<Project | null> {
  const { rows, persist } = await listProjects();
  const project = rows.find((row) => row.id === id) ?? null;
  if (project) {
    return project;
  }
  if (persist === "memory") {
    return null;
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error) {
    return data ? mapProject(data) : null;
  }
  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }
  return null;
}

export async function saveProject(input: Omit<Project, "id" | "createdBy">, id?: string) {
  const { user } = await requireUser();
  const { row } = await writeRow(
    "projects",
    {
      name: input.name,
      job_number: input.jobNumber,
      address: input.address,
      status: input.status,
      created_by: user.id,
    },
    id,
  );
  return mapProject(row);
}

export async function deleteProject(id: string) {
  await removeRow("projects", id);
}

export async function listCrmLeads(projectId?: string): Promise<ListResult<CrmLead>> {
  const result = await queryRows("crm_leads", { projectId });
  return { persist: result.persist, rows: result.rows.map(mapCrm) };
}

export async function saveCrmLead(input: Omit<CrmLead, "id">, id?: string) {
  const { row } = await writeRow(
    "crm_leads",
    {
      project_id: input.projectId || null,
      name: input.name,
      company: input.company,
      stage: input.stage,
      notes: input.notes,
    },
    id,
  );
  return mapCrm(row);
}

export async function deleteCrmLead(id: string) {
  await removeRow("crm_leads", id);
}

export async function listFieldReports(projectId?: string): Promise<ListResult<FieldReport>> {
  const result = await queryRows("field_reports", {
    orderBy: "report_date",
    ascending: false,
    projectId,
  });
  const rows = result.rows.map(mapField).sort((a, b) => b.date.localeCompare(a.date));
  return { persist: result.persist, rows };
}

export async function getFieldReportByDate(date: string, projectId?: string): Promise<FieldReport | null> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("field_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("report_date", date);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("updated_at", { ascending: false }).limit(1);

  if (!error) {
    return data?.[0] ? mapField(data[0]) : null;
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  if (projectId) {
    const unscoped = await supabase
      .from("field_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_date", date)
      .order("updated_at", { ascending: false })
      .limit(8);

    if (!unscoped.error) {
      const match = (unscoped.data ?? []).find((item) => asProjectId(item.project_id) === projectId);
      return match ? mapField(match) : null;
    }

    if (unscoped.error && !isMissingRelation(unscoped.error)) {
      throw new Error(unscoped.error.message);
    }
  }

  const row = getMemory("field_reports", user.id).find(
    (item) =>
      asDate(item.report_date) === date && (!projectId || asProjectId(item.project_id) === projectId),
  );
  return row ? mapField(row) : null;
}

export async function saveFieldReport(input: Omit<FieldReport, "id">, id?: string) {
  let targetId = id;
  if (!targetId) {
    const existing = await getFieldReportByDate(input.date, input.projectId || undefined);
    if (existing) {
      targetId = existing.id;
    }
  }

  const { row } = await writeRow("field_reports", fieldReportValues(input), targetId);
  return mapField(row);
}

export async function deleteFieldReport(id: string) {
  await removeRow("field_reports", id);
}

export async function listFieldJobs(projectId?: string): Promise<ListResult<FieldJob>> {
  const result = await queryRows("field_jobs", { orderBy: "updated_at", ascending: false, projectId });
  return { persist: result.persist, rows: result.rows.map(mapFieldJob) };
}

export async function saveFieldJob(input: Omit<FieldJob, "id">, id?: string) {
  let targetId = id;
  if (!targetId) {
    const existing = await listFieldJobs(input.projectId || undefined);
    if (existing.rows[0]) {
      targetId = existing.rows[0].id;
    }
  }

  const { row } = await writeRow(
    "field_jobs",
    {
      project_id: input.projectId || null,
      company_name: input.companyName,
      job_title: input.jobTitle,
      job_number: input.jobNumber,
      address: input.address,
      client: input.client,
      superintendent: input.superintendent,
    },
    targetId,
  );
  return mapFieldJob(row);
}

export async function listFieldRfis(projectId?: string): Promise<ListResult<FieldRfi>> {
  const result = await queryRows("field_rfis", { orderBy: "due_date", ascending: true, projectId });
  const rows = result.rows.map(mapFieldRfi).sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "open" ? -1 : 1;
    }
    return a.dueDate.localeCompare(b.dueDate);
  });
  return { persist: result.persist, rows };
}

export async function saveFieldRfi(input: Omit<FieldRfi, "id">, id?: string) {
  const { row } = await writeRow(
    "field_rfis",
    {
      project_id: input.projectId || null,
      number: input.number,
      title: input.title,
      description: input.description,
      status: input.status,
      due_date: input.dueDate,
    },
    id,
  );
  return mapFieldRfi(row);
}

export async function deleteFieldRfi(id: string) {
  await removeRow("field_rfis", id);
}

export async function listCostJobs(projectId?: string): Promise<ListResult<CostJob>> {
  const result = await queryRows("cost_jobs", { projectId });
  return { persist: result.persist, rows: result.rows.map(mapCost) };
}

export async function saveCostJob(input: Omit<CostJob, "id">, id?: string) {
  const { row } = await writeRow(
    "cost_jobs",
    {
      project_id: input.projectId || null,
      job: input.job,
      budget: input.budget,
      committed: input.committed,
      actual: input.actual,
    },
    id,
  );
  return mapCost(row);
}

export async function deleteCostJob(id: string) {
  await removeRow("cost_jobs", id);
}

export async function listSafetyLogs(projectId?: string): Promise<ListResult<SafetyLog>> {
  const result = await queryRows("safety_logs", { projectId });
  return { persist: result.persist, rows: result.rows.map(mapSafety) };
}

export async function saveSafetyLog(input: Omit<SafetyLog, "id">, id?: string) {
  const { row } = await writeRow(
    "safety_logs",
    {
      project_id: input.projectId || null,
      entry_type: input.type,
      entry_date: input.date,
      location: input.location,
      notes: input.notes,
    },
    id,
  );
  return mapSafety(row);
}

export async function deleteSafetyLog(id: string) {
  await removeRow("safety_logs", id);
}

export async function listTrakMilestones(projectId?: string): Promise<ListResult<TrakMilestone>> {
  const result = await queryRows("trak_milestones", { projectId });
  return { persist: result.persist, rows: result.rows.map(mapTrak) };
}

export async function saveTrakMilestone(input: Omit<TrakMilestone, "id">, id?: string) {
  const { row } = await writeRow(
    "trak_milestones",
    {
      project_id: input.projectId || null,
      activity: input.activity,
      start_date: input.start,
      finish_date: input.finish,
      percent_complete: input.percentComplete,
    },
    id,
  );
  return mapTrak(row);
}

export async function deleteTrakMilestone(id: string) {
  await removeRow("trak_milestones", id);
}

export async function listBidChases(projectId?: string): Promise<ListResult<BidChase>> {
  const result = await queryRows("bid_chases", { projectId });
  return { persist: result.persist, rows: result.rows.map(mapBid) };
}

export async function saveBidChase(input: Omit<BidChase, "id">, id?: string) {
  const { row } = await writeRow(
    "bid_chases",
    {
      project_id: input.projectId || null,
      project: input.project,
      due_date: input.dueDate,
      status: input.status,
      estimate_value: input.estimateValue,
    },
    id,
  );
  return mapBid(row);
}

export async function deleteBidChase(id: string) {
  await removeRow("bid_chases", id);
}
