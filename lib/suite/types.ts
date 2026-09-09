export type PersistMode = "supabase" | "memory";

export type SuiteTable =
  | "crm_leads"
  | "field_reports"
  | "field_jobs"
  | "field_rfis"
  | "cost_jobs"
  | "safety_logs"
  | "trak_milestones"
  | "bid_chases";

export type CrmLead = {
  id: string;
  name: string;
  company: string;
  stage: string;
  notes: string;
};

export type FieldLogStatus = "draft" | "final";

export type FieldReport = {
  id: string;
  date: string;
  jobName: string;
  weather: string;
  weatherPm: string;
  tempLow: string;
  tempHigh: string;
  precip: string;
  wind: string;
  ground: string;
  notes: string;
  crewCount: number;
  manHours: number;
  workPerformed: string;
  delays: string;
  materials: string;
  visitors: string;
  preparedBy: string;
  preparedTitle: string;
  shiftStart: string;
  shiftEnd: string;
  status: FieldLogStatus;
};

export type FieldJob = {
  id: string;
  companyName: string;
  jobTitle: string;
  jobNumber: string;
  address: string;
  client: string;
  superintendent: string;
};

export type FieldRfiStatus = "open" | "closed";

export type FieldRfi = {
  id: string;
  number: string;
  title: string;
  description: string;
  status: FieldRfiStatus;
  dueDate: string;
};

export type CostJob = {
  id: string;
  job: string;
  budget: number;
  committed: number;
  actual: number;
};

export type SafetyLog = {
  id: string;
  type: string;
  date: string;
  location: string;
  notes: string;
};

export type TrakMilestone = {
  id: string;
  activity: string;
  start: string;
  finish: string;
  percentComplete: number;
};

export type BidChase = {
  id: string;
  project: string;
  dueDate: string;
  status: string;
  estimateValue: number;
};

export type SuiteRecord =
  | CrmLead
  | FieldReport
  | FieldJob
  | FieldRfi
  | CostJob
  | SafetyLog
  | TrakMilestone
  | BidChase;

export type ListResult<T> = {
  rows: T[];
  persist: PersistMode;
};
