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
  SafetyLog,
  SuiteTable,
  TrakMilestone,
} from "@/lib/suite/types";
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

function mapCrm(row: DbRow): CrmLead {
  return {
    id: asString(row.id),
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
    number: asString(row.number),
    title: asString(row.title),
    description: asString(row.description),
    status: asRfiStatus(row.status),
    dueDate: asDate(row.due_date),
  };
}

function fieldReportValues(input: Omit<FieldReport, "id">): DbRow {
  return {
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
    job: asString(row.job),
    budget: asNumber(row.budget),
    committed: asNumber(row.committed),
    actual: asNumber(row.actual),
  };
}

function mapSafety(row: DbRow): SafetyLog {
  return {
    id: asString(row.id),
    type: asString(row.entry_type),
    date: asDate(row.entry_date),
    location: asString(row.location),
    notes: asString(row.notes),
  };
}

function mapTrak(row: DbRow): TrakMilestone {
  return {
    id: asString(row.id),
    activity: asString(row.activity),
    start: asDate(row.start_date),
    finish: asDate(row.finish_date),
    percentComplete: asNumber(row.percent_complete),
  };
}

function mapBid(row: DbRow): BidChase {
  return {
    id: asString(row.id),
    project: asString(row.project),
    dueDate: asDate(row.due_date),
    status: asString(row.status),
    estimateValue: asNumber(row.estimate_value),
  };
}

async function queryRows(
  table: SuiteTable,
  options: { orderBy?: string; ascending?: boolean } = {},
): Promise<{ rows: DbRow[]; persist: PersistMode }> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", user.id)
    .order(options.orderBy ?? "created_at", { ascending: options.ascending ?? false });

  if (!error) {
    return { rows: data ?? [], persist: "supabase" };
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  return { rows: getMemory(table, user.id), persist: "memory" };
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

export async function listCrmLeads(): Promise<ListResult<CrmLead>> {
  const result = await queryRows("crm_leads");
  return { persist: result.persist, rows: result.rows.map(mapCrm) };
}

export async function saveCrmLead(input: Omit<CrmLead, "id">, id?: string) {
  const { row } = await writeRow(
    "crm_leads",
    {
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

export async function listFieldReports(): Promise<ListResult<FieldReport>> {
  const result = await queryRows("field_reports", { orderBy: "report_date", ascending: false });
  const rows = result.rows.map(mapField).sort((a, b) => b.date.localeCompare(a.date));
  return { persist: result.persist, rows };
}

export async function getFieldReportByDate(date: string): Promise<FieldReport | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("field_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("report_date", date)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!error) {
    return data?.[0] ? mapField(data[0]) : null;
  }

  if (!isMissingRelation(error)) {
    throw new Error(error.message);
  }

  const row = getMemory("field_reports", user.id).find((item) => asDate(item.report_date) === date);
  return row ? mapField(row) : null;
}

export async function saveFieldReport(input: Omit<FieldReport, "id">, id?: string) {
  let targetId = id;
  if (!targetId) {
    const existing = await getFieldReportByDate(input.date);
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

export async function listFieldJobs(): Promise<ListResult<FieldJob>> {
  const result = await queryRows("field_jobs", { orderBy: "updated_at", ascending: false });
  return { persist: result.persist, rows: result.rows.map(mapFieldJob) };
}

export async function saveFieldJob(input: Omit<FieldJob, "id">, id?: string) {
  let targetId = id;
  if (!targetId) {
    const existing = await listFieldJobs();
    if (existing.rows[0]) {
      targetId = existing.rows[0].id;
    }
  }

  const { row } = await writeRow(
    "field_jobs",
    {
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

export async function listFieldRfis(): Promise<ListResult<FieldRfi>> {
  const result = await queryRows("field_rfis", { orderBy: "due_date", ascending: true });
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

export async function listCostJobs(): Promise<ListResult<CostJob>> {
  const result = await queryRows("cost_jobs");
  return { persist: result.persist, rows: result.rows.map(mapCost) };
}

export async function saveCostJob(input: Omit<CostJob, "id">, id?: string) {
  const { row } = await writeRow(
    "cost_jobs",
    {
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

export async function listSafetyLogs(): Promise<ListResult<SafetyLog>> {
  const result = await queryRows("safety_logs");
  return { persist: result.persist, rows: result.rows.map(mapSafety) };
}

export async function saveSafetyLog(input: Omit<SafetyLog, "id">, id?: string) {
  const { row } = await writeRow(
    "safety_logs",
    {
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

export async function listTrakMilestones(): Promise<ListResult<TrakMilestone>> {
  const result = await queryRows("trak_milestones");
  return { persist: result.persist, rows: result.rows.map(mapTrak) };
}

export async function saveTrakMilestone(input: Omit<TrakMilestone, "id">, id?: string) {
  const { row } = await writeRow(
    "trak_milestones",
    {
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

export async function listBidChases(): Promise<ListResult<BidChase>> {
  const result = await queryRows("bid_chases");
  return { persist: result.persist, rows: result.rows.map(mapBid) };
}

export async function saveBidChase(input: Omit<BidChase, "id">, id?: string) {
  const { row } = await writeRow(
    "bid_chases",
    {
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
