export type PersistMode = "supabase" | "memory";

export type SuiteTable =
  | "projects"
  | "crm_leads"
  | "field_reports"
  | "field_jobs"
  | "field_rfis"
  | "cost_jobs"
  | "change_orders"
  | "safety_logs"
  | "trak_milestones"
  | "bid_chases";

export type ContractorSource = "import" | "manual";

export type BidContractor = {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  office: string;
  cell: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  categories: string;
  notes: string;
  source: ContractorSource;
};

export type BidPackage = {
  id: string;
  orgId: string;
  projectId: string;
  projectName: string;
  title: string;
  dueAt: string;
  drawingsTeamsUrl: string;
  notes: string;
  buildingConnectedSent: boolean;
};

export type BidInviteeStatus = "draft" | "invited" | "opened" | "declined";

export type BidInvitee = {
  id: string;
  packageId: string;
  contractorId: string;
  userId: string;
  email: string;
  name: string;
  company: string;
  trade: string;
  status: BidInviteeStatus;
  invitedAt: string;
  magicLinkSentAt: string;
};

export type FieldPhoto = {
  id: string;
  projectId: string;
  reportId: string;
  storagePath: string;
  caption: string;
  url: string;
};

export type ProjectStatus = "Active" | "Bidding" | "On Hold" | "Closed";

export type Project = {
  id: string;
  name: string;
  jobNumber: string;
  address: string;
  status: ProjectStatus;
  createdBy: string;
};

export type CrmLead = {
  id: string;
  projectId: string;
  name: string;
  company: string;
  stage: string;
  nextAction: string;
  value: number;
  notes: string;
};

export type FieldLogStatus = "draft" | "final";

export type FieldReport = {
  id: string;
  projectId: string;
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
  projectId: string;
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
  projectId: string;
  number: string;
  title: string;
  description: string;
  status: FieldRfiStatus;
  dueDate: string;
};

export type CostJob = {
  id: string;
  projectId: string;
  job: string;
  budget: number;
  committed: number;
  actual: number;
};

export type ChangeOrderType = "Owner" | "Unforeseen" | "Deduct" | "Allowance" | "Other";

export type ChangeOrderStatus = "Proposed" | "Pricing" | "Approved" | "Rejected";

export type ChangeOrder = {
  id: string;
  projectId: string;
  number: string;
  title: string;
  description: string;
  type: ChangeOrderType;
  amount: number;
  status: ChangeOrderStatus;
  submittedDate: string;
  decidedDate: string;
  notes: string;
};

export type SafetyLog = {
  id: string;
  projectId: string;
  type: string;
  date: string;
  location: string;
  notes: string;
  whatHappened: string;
  whoInvolved: string;
  correctiveAction: string;
  attendeeCount: number;
};

export type TrakMilestone = {
  id: string;
  projectId: string;
  activity: string;
  start: string;
  finish: string;
  percentComplete: number;
  status: string;
  owner: string;
};

export type BidChase = {
  id: string;
  projectId: string;
  project: string;
  dueDate: string;
  status: string;
  estimateValue: number;
};

export type SuiteRecord =
  | Project
  | CrmLead
  | FieldReport
  | FieldJob
  | FieldRfi
  | CostJob
  | ChangeOrder
  | SafetyLog
  | TrakMilestone
  | BidChase;

export type ListResult<T> = {
  rows: T[];
  persist: PersistMode;
};
