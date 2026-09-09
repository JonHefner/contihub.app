export type PersistMode = "supabase" | "memory";

export type SuiteTable =
  | "crm_leads"
  | "field_reports"
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

export type FieldReport = {
  id: string;
  date: string;
  jobName: string;
  weather: string;
  notes: string;
  crewCount: number;
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

export type SuiteRecord = CrmLead | FieldReport | CostJob | SafetyLog | TrakMilestone | BidChase;

export type ListResult<T> = {
  rows: T[];
  persist: PersistMode;
};
