export const RFI_ROLES = [
  "intake_reviewer",
  "architect_liaison",
  "owner_liaison",
  "superintendent",
  "distributor",
  "admin",
] as const;

export type RfiRole = (typeof RFI_ROLES)[number];

export const RFI_TYPES = ["design_docs", "owner_decision"] as const;

export type RfiType = (typeof RFI_TYPES)[number];

export const RFI_STATUSES = [
  "draft",
  "doc_review",
  "writing",
  "outcomes",
  "routed",
  "waiting",
  "closed",
  "complete",
] as const;

export type RfiStatus = (typeof RFI_STATUSES)[number];

export const RFI_URGENCIES = ["low", "normal", "high", "critical"] as const;

export type RfiUrgency = (typeof RFI_URGENCIES)[number];

export const RFI_COST_IMPACTS = ["add", "deduct", "none", "unknown"] as const;

export type RfiCostImpact = (typeof RFI_COST_IMPACTS)[number];

export const RFI_SCHEDULE_IMPACTS = ["yes", "no", "unknown"] as const;

export type RfiScheduleImpact = (typeof RFI_SCHEDULE_IMPACTS)[number];

export type RfiIntent = "save" | "route" | "return" | "distribute" | "close_docs";

export const RFI_ROLE_LABELS: Record<RfiRole, string> = {
  intake_reviewer: "Intake reviewer",
  architect_liaison: "Architect liaison",
  owner_liaison: "Owner liaison",
  superintendent: "Superintendent",
  distributor: "Distributor",
  admin: "Admin",
};

export const RFI_STATUS_LABELS: Record<RfiStatus, string> = {
  draft: "Draft",
  doc_review: "Doc review",
  writing: "Writing",
  outcomes: "Outcomes",
  routed: "Routed",
  waiting: "Waiting",
  closed: "Closed",
  complete: "Complete",
};

export const RFI_TYPE_LABELS: Record<RfiType, string> = {
  design_docs: "Design / documents",
  owner_decision: "Owner decision",
};

export const DEFAULT_TYPE_ROUTES: { rfiType: RfiType; label: string; targetRole: "architect_liaison" | "owner_liaison" }[] = [
  { rfiType: "design_docs", label: "Design / documents", targetRole: "architect_liaison" },
  { rfiType: "owner_decision", label: "Owner decision", targetRole: "owner_liaison" },
];

export const DEFAULT_OUTCOMES = [
  "Proceed as drawn. No change to cost or schedule.",
  "Revise the detail and confirm cost and schedule impact before work continues.",
  "Hold the affected work until the official response is logged.",
];

export const DEFAULT_ROSTER: { displayName: string; email: string; role: RfiRole; notes: string }[] = [
  {
    displayName: "Ann Saccone",
    email: "ann.saccone@continentalcando.com",
    role: "admin",
    notes: "Admin seat. Add or remove people by setting the roster row inactive.",
  },
  {
    displayName: "Ann Saccone",
    email: "ann.saccone@continentalcando.com",
    role: "intake_reviewer",
    notes: "Intake reviewer.",
  },
  {
    displayName: "Michael Might",
    email: "michael.might@continentalcando.com",
    role: "superintendent",
    notes: "Conti Field superintendent seat.",
  },
  {
    displayName: "Ryan Roberts",
    email: "ryan.roberts@continentalcando.com",
    role: "architect_liaison",
    notes: "Architect liaison for design and document RFIs.",
  },
  {
    displayName: "Braden Farmer",
    email: "Braden.Farmer@continentalcando.com",
    role: "distributor",
    notes: "Distributor seat. Pushes the logged RFI to the field and affected subcontractors.",
  },
];

export const DOC_REVIEW_STUB =
  "ContiRFI stays the draft and document-review process. The suggested-outcomes form is ContiHub. Paste citations from the Teams file set. Quote the printed sheet label and the words on the sheet. Hub does not invent an answer or a sheet number. If the documents already answer the question, close it with the drafter and do not issue.";

export function rosterCorrection(role: string, displayName: string, email: string) {
  const name = displayName.trim().toLowerCase();
  const mail = email.trim().toLowerCase();
  let targetName = "";
  if (
    (role === "admin" || role === "intake_reviewer") &&
    (name === "anne saccone" || name === "ann saccone" || mail === "ann.saccone@continentalcando.com")
  ) {
    targetName = "Ann Saccone";
  } else if (
    role === "superintendent" &&
    (name === "michael might" || mail === "michael.might@continentalcando.com" || (name === "mike" && mail === ""))
  ) {
    targetName = "Michael Might";
  } else if (
    role === "architect_liaison" &&
    (name === "ryan roberts" || name === "mike ryan roberts" || mail === "ryan.roberts@continentalcando.com")
  ) {
    targetName = "Ryan Roberts";
  } else if (role === "distributor" && (name === "braden farmer" || mail === "braden.farmer@continentalcando.com")) {
    targetName = "Braden Farmer";
  } else {
    return null;
  }
  const canonical = DEFAULT_ROSTER.find((seat) => seat.role === role && seat.displayName === targetName);
  if (!canonical) {
    return null;
  }
  if (displayName.trim() === canonical.displayName && mail === canonical.email.toLowerCase()) {
    return null;
  }
  return { displayName: canonical.displayName, email: canonical.email, notes: canonical.notes };
}

export const SAMPLE_RFI_NUMBER = "RFI-P01";

export const SAMPLE_RFI = {
  number: SAMPLE_RFI_NUMBER,
  subject: "SAMPLE — Switchgear working clearance",
  question: "SAMPLE — What working clearance is required at the main switchgear?",
  improvedQuestion:
    "SAMPLE — Confirm the working clearance at the main switchgear and whether the equipment pad must move before the pour.",
  citations:
    "SAMPLE only. Not from a drawing set. Do not treat these words as a sheet citation. Paste verbatim quotes and printed sheet labels from Teams before issuing a live RFI.",
  docReviewNotes: DOC_REVIEW_STUB,
  fromName: "SAMPLE — Conti field",
  toName: "Ryan Roberts",
  urgency: "normal" as RfiUrgency,
  rfiType: "design_docs" as RfiType,
  costImpact: "unknown" as RfiCostImpact,
  scheduleImpact: "unknown" as RfiScheduleImpact,
  teamsDocsUrl: "https://teams.microsoft.com/l/channel/SAMPLE-data-center-drawings",
  outcomes: [
    "SAMPLE — Proceed as drawn. No change to cost or schedule.",
    "SAMPLE — Revise the clearance detail and confirm cost and schedule before work continues.",
    "SAMPLE — Hold the affected work until the official response is logged.",
  ],
  selectedIndex: 1,
};

export type RfiRosterSeat = {
  id: string;
  orgId: string;
  projectId: string;
  displayName: string;
  email: string;
  role: RfiRole;
  active: boolean;
  notes: string;
};

export type RfiTypeRoute = {
  id: string;
  rfiType: RfiType;
  label: string;
  targetRole: "architect_liaison" | "owner_liaison";
  active: boolean;
};

export type RfiOutcome = {
  id: string;
  rfiId: string;
  label: string;
  sortOrder: number;
  selected: boolean;
};

export type RfiDistribution = {
  id: string;
  rfiId: string;
  recipientKind: "superintendent" | "subcontractor";
  name: string;
  email: string;
  contractorId: string;
  rosterId: string;
  draftSubject: string;
  draftBody: string;
  sentAt: string;
};

export type RfiItem = {
  id: string;
  orgId: string;
  projectId: string;
  number: string;
  subject: string;
  question: string;
  improvedQuestion: string;
  citations: string;
  docReviewNotes: string;
  docsAlreadyAnswer: boolean;
  urgency: RfiUrgency;
  rfiType: RfiType;
  routeRole: RfiRole | "";
  fromName: string;
  toName: string;
  dateRequired: string;
  costImpact: RfiCostImpact;
  scheduleImpact: RfiScheduleImpact;
  status: RfiStatus;
  officialResponse: string;
  returnedAt: string;
  teamsDocsUrl: string;
  costPingNote: string;
  loggedAt: string;
  distributedAt: string;
  selectedOutcome: string;
  fieldRfiId: string;
};

export type RfiDraft = {
  id?: string;
  projectId: string;
  number: string;
  subject: string;
  question: string;
  improvedQuestion: string;
  citations: string;
  docReviewNotes: string;
  docsAlreadyAnswer: boolean;
  urgency: RfiUrgency;
  rfiType: RfiType;
  fromName: string;
  toName: string;
  dateRequired: string;
  costImpact: RfiCostImpact;
  scheduleImpact: RfiScheduleImpact;
  officialResponse: string;
  returnedAt: string;
  teamsDocsUrl: string;
  outcomes: string[];
  selectedIndex: number;
  returnStatus?: "waiting" | "closed" | "complete";
  contractorIds?: string[];
};

const URGENCY_TAGS: Record<RfiUrgency, string> = {
  low: "RFI-LOW",
  normal: "RFI-NORMAL",
  high: "RFI-HIGH",
  critical: "RFI-CRITICAL",
};

export function routeRoleForType(rfiType: string): "architect_liaison" | "owner_liaison" | "" {
  if (rfiType === "design_docs") {
    return "architect_liaison";
  }
  if (rfiType === "owner_decision") {
    return "owner_liaison";
  }
  return "";
}

export function routeRoleFromConfig(
  rfiType: string,
  routes: { rfiType: string; targetRole: "architect_liaison" | "owner_liaison"; active: boolean }[],
) {
  const match = routes.find((route) => route.active && route.rfiType === rfiType);
  if (match) {
    return match.targetRole;
  }
  return routeRoleForType(rfiType);
}

export function urgencyTag(urgency: string) {
  if (urgency === "low" || urgency === "normal" || urgency === "high" || urgency === "critical") {
    return URGENCY_TAGS[urgency];
  }
  return URGENCY_TAGS.normal;
}

export function isPipelineOpen(status: string) {
  return status !== "closed" && status !== "complete";
}

export function fieldStatusForPipeline(status: string): "open" | "closed" {
  return status === "closed" || status === "complete" ? "closed" : "open";
}

export function countOpenRfis(
  pipeline: { projectId: string; number: string; status: string }[],
  field: { projectId: string; number: string; status: string }[],
) {
  const pipelineKeys = new Set(pipeline.map((row) => `${row.projectId}:${row.number}`));
  const openPipeline = pipeline.filter((row) => isPipelineOpen(row.status)).length;
  const extraField = field.filter(
    (row) => row.status === "open" && !pipelineKeys.has(`${row.projectId}:${row.number}`),
  ).length;
  return openPipeline + extraField;
}

export function nextPipelineNumber(numbers: string[]) {
  let max = 0;
  for (const number of numbers) {
    const match = /^RFI-(\d+)$/.exec(number.trim());
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `RFI-${String(max + 1).padStart(3, "0")}`;
}

export function costPingNote(impact: string) {
  if (impact === "none") {
    return "";
  }
  return "Cost ping: review with estimating before the official response changes the job. Do not commit money or sign a change order from this RFI.";
}

export function statusAfterSave(
  current: RfiStatus,
  input: { docReviewNotes: string; citations: string; improvedQuestion: string; outcomes: string[] },
): RfiStatus {
  if (current === "routed" || current === "waiting" || current === "closed" || current === "complete") {
    return current;
  }
  const filled = input.outcomes.map((outcome) => outcome.trim()).filter(Boolean);
  if (filled.length >= 2) {
    return "outcomes";
  }
  if (input.improvedQuestion.trim()) {
    return "writing";
  }
  if (input.docReviewNotes.trim() || input.citations.trim()) {
    return "doc_review";
  }
  return "draft";
}

export function routeBlockReason(input: {
  docsAlreadyAnswer: boolean;
  docReviewNotes: string;
  citations: string;
  question: string;
  improvedQuestion: string;
  outcomes: string[];
  selectedIndex: number;
  rfiType: string;
}) {
  if (input.docsAlreadyAnswer) {
    return "Documents already answer this question. Close it with the drafter. Do not route.";
  }
  if (!input.docReviewNotes.trim() && !input.citations.trim()) {
    return "Doc review notes or citations are required before routing. Paste them from the file set. Do not invent sheet content.";
  }
  if (!input.improvedQuestion.trim() && !input.question.trim()) {
    return "A question is required.";
  }
  const labels = input.outcomes.map((outcome) => outcome.trim()).filter(Boolean);
  if (labels.length < 2) {
    return "Add at least two suggested outcomes.";
  }
  if (input.selectedIndex < 0 || !input.outcomes[input.selectedIndex]?.trim()) {
    return "Select one suggested outcome.";
  }
  if (!routeRoleForType(input.rfiType)) {
    return "Choose an RFI type so Hub can route to the architect or the owner.";
  }
  return null;
}

export function activeSeats<T extends { role: string; active: boolean; projectId: string }>(
  roster: T[],
  role: string,
  projectId: string,
) {
  return roster.filter((seat) => seat.active && seat.role === role && (!seat.projectId || seat.projectId === projectId));
}

export function cleanTeamsUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Teams documents link must start with http:// or https://.");
  }
  return trimmed;
}

export function cleanRosterEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Roster email must be blank (TBD) or a valid address.");
  }
  return trimmed;
}

export function requireUrgency(value: string): RfiUrgency {
  if (value === "low" || value === "normal" || value === "high" || value === "critical") {
    return value;
  }
  throw new Error("Urgency must be Low, Normal, High, or Critical.");
}

export function requireRfiType(value: string): RfiType {
  if (value === "design_docs" || value === "owner_decision") {
    return value;
  }
  throw new Error("RFI type must be design/documents or owner decision.");
}

export function requireCostImpact(value: string): RfiCostImpact {
  if (value === "add" || value === "deduct" || value === "none" || value === "unknown") {
    return value;
  }
  throw new Error("Cost impact must be add, deduct, none, or unknown.");
}

export function requireScheduleImpact(value: string): RfiScheduleImpact {
  if (value === "yes" || value === "no" || value === "unknown") {
    return value;
  }
  throw new Error("Schedule impact must be yes, no, or unknown.");
}

export function requireRole(value: string): RfiRole {
  if ((RFI_ROLES as readonly string[]).includes(value)) {
    return value as RfiRole;
  }
  throw new Error("Roster role is not one of the six Conti seats.");
}

export function buildRouteDraft(input: {
  number: string;
  subject: string;
  urgency: string;
  fromName: string;
  toName: string;
  question: string;
  improvedQuestion: string;
  citations: string;
  outcomes: { label: string; selected: boolean }[];
  costPingNote: string;
}) {
  const lines = [
    `RFI ${input.number}`,
    `To: ${input.toName || "Reviewer"}`,
    `From: ${input.fromName || "Continental Construction"}`,
    "",
    "This draft is for review. Suggested outcomes are editable. They are not an official answer, and ContiHub does not invent drawing citations.",
    "",
    "Question:",
    input.improvedQuestion.trim() || input.question.trim(),
    "",
    "Citations pasted by staff:",
    input.citations.trim() || "(none yet)",
    "",
    "Suggested outcomes:",
    ...input.outcomes
      .filter((outcome) => outcome.label.trim())
      .map((outcome, index) => `${index + 1}. ${outcome.label.trim()}${outcome.selected ? " — suggested" : ""}`),
  ];
  if (input.costPingNote.trim()) {
    lines.push("", input.costPingNote.trim());
  }
  lines.push("", "Reply with the official response so ContiHub can log it and notify the field.");
  return {
    subject: `[${urgencyTag(input.urgency)}] ${input.number} ${input.subject}`.replace(/\s+/g, " ").trim(),
    body: lines.join("\n"),
  };
}

export function buildDistributeDraft(input: {
  number: string;
  subject: string;
  urgency: string;
  question: string;
  officialResponse: string;
  selectedOutcome: string;
}) {
  const lines = [
    `RFI ${input.number} is in the ContiHub RFI log.`,
    "",
    "Question:",
    input.question.trim() || "(none)",
    "",
    "Official response:",
    input.officialResponse.trim() || "(not logged yet)",
  ];
  if (input.selectedOutcome.trim()) {
    lines.push("", `Suggested outcome Conti carried: ${input.selectedOutcome.trim()}`);
  }
  lines.push(
    "",
    "This message is a draft for the superintendent and affected subcontractors. Copy it or open mailto. It does not replace the architect or owner response.",
  );
  return {
    subject: `[${urgencyTag(input.urgency)}] ${input.number} ${input.subject} — logged`.replace(/\s+/g, " ").trim(),
    body: lines.join("\n"),
  };
}

export function mailtoHref(email: string, subject: string, body: string) {
  const to = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return "";
  }
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
