import type { ChangeOrder, ChangeOrderStatus, ChangeOrderType } from "@/lib/suite/types";

export const CHANGE_ORDER_TYPES: ChangeOrderType[] = [
  "Owner",
  "Unforeseen",
  "Deduct",
  "Allowance",
  "Other",
];

export const CHANGE_ORDER_STATUSES: ChangeOrderStatus[] = [
  "Proposed",
  "Pricing",
  "Approved",
  "Rejected",
];

export const SAMPLE_STADIUM_PROJECT_NAME = "Midwest Regional Stadium Renovation";
export const SAMPLE_STADIUM_JOB_NUMBER = "MRS-26-014";
export const SAMPLE_STADIUM_ADDRESS = "1400 Stadium Drive, Columbus, OH";

export type ChangeOrderInput = Omit<ChangeOrder, "id" | "projectId">;

export type ChangeOrderSummary = {
  proposedTotal: number;
  pricingTotal: number;
  approvedTotal: number;
  rejectedTotal: number;
  pendingTotal: number;
  netOwnerExposure: number;
  count: number;
  pendingCount: number;
  approvedCount: number;
};

const emptySummary = (): ChangeOrderSummary => ({
  proposedTotal: 0,
  pricingTotal: 0,
  approvedTotal: 0,
  rejectedTotal: 0,
  pendingTotal: 0,
  netOwnerExposure: 0,
  count: 0,
  pendingCount: 0,
  approvedCount: 0,
});

export function isChangeOrderType(value: string): value is ChangeOrderType {
  return CHANGE_ORDER_TYPES.includes(value as ChangeOrderType);
}

export function isChangeOrderStatus(value: string): value is ChangeOrderStatus {
  return CHANGE_ORDER_STATUSES.includes(value as ChangeOrderStatus);
}

export function normalizeChangeOrderAmount(type: ChangeOrderType, amount: number) {
  if (type === "Deduct" && amount > 0) {
    return Math.round(-amount * 100) / 100;
  }
  return Math.round(amount * 100) / 100;
}

export function nextChangeOrderNumber(rows: Array<{ number: string }>) {
  const max = rows.reduce((current, row) => {
    const match = row.number.match(/(\d+)\s*$/);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 0);
  return `CO-${String(max + 1).padStart(3, "0")}`;
}

export function summarizeChangeOrders(rows: Array<{ amount: number; status: ChangeOrderStatus }>): ChangeOrderSummary {
  return rows.reduce((summary, row) => {
    summary.count += 1;
    if (row.status === "Proposed") {
      summary.proposedTotal += row.amount;
      summary.pendingTotal += row.amount;
      summary.pendingCount += 1;
      summary.netOwnerExposure += row.amount;
    } else if (row.status === "Pricing") {
      summary.pricingTotal += row.amount;
      summary.pendingTotal += row.amount;
      summary.pendingCount += 1;
      summary.netOwnerExposure += row.amount;
    } else if (row.status === "Approved") {
      summary.approvedTotal += row.amount;
      summary.approvedCount += 1;
      summary.netOwnerExposure += row.amount;
    } else if (row.status === "Rejected") {
      summary.rejectedTotal += row.amount;
    }
    return summary;
  }, emptySummary());
}

/**
 * Fictional stadium demo only — do not use United CLE or live lead names.
 * Pending (Proposed + Pricing) $393,650 · Approved $282,900 · Exposure $676,550.
 */
export const SAMPLE_CHANGE_ORDERS: ChangeOrderInput[] = [
  {
    number: "CO-001",
    title: "Additional suite-level millwork",
    description: "Owner-directed upgrade to club-level suite casework and reception desks.",
    type: "Owner",
    amount: 185000,
    status: "Proposed",
    submittedDate: "2026-03-04",
    decidedDate: "",
    notes: "Awaiting owner review of finish package B.",
  },
  {
    number: "CO-002",
    title: "Existing concourse slab replacement",
    description: "Unforeseen failed slab at the lower concourse pour-back after demo.",
    type: "Unforeseen",
    amount: 92400,
    status: "Pricing",
    submittedDate: "2026-03-18",
    decidedDate: "",
    notes: "GC pricing rebar and overnight pour window.",
  },
  {
    number: "CO-003",
    title: "Video board structural steel add",
    description: "Owner added a larger center-hung board; extra steel and catwalk.",
    type: "Owner",
    amount: 246800,
    status: "Approved",
    submittedDate: "2026-02-20",
    decidedDate: "2026-03-11",
    notes: "Executed. Shop drawings released.",
  },
  {
    number: "CO-004",
    title: "Delete unused ticket booth build-out",
    description: "Deduct unused south-gate booth that the owner dropped from the program.",
    type: "Deduct",
    amount: -18500,
    status: "Approved",
    submittedDate: "2026-03-01",
    decidedDate: "2026-03-15",
    notes: "Credit issued against the original ticket-booth allowance.",
  },
  {
    number: "CO-005",
    title: "Premium seating finish allowance",
    description: "Allowance draw for club-seat upholstery and aisle lighting extras.",
    type: "Allowance",
    amount: 75000,
    status: "Pricing",
    submittedDate: "2026-04-02",
    decidedDate: "",
    notes: "Vendor quotes in; owner to pick fabric.",
  },
  {
    number: "CO-006",
    title: "Temporary winter enclosure at north bowl",
    description: "Weather protection so structural steel can continue through January.",
    type: "Other",
    amount: 41250,
    status: "Proposed",
    submittedDate: "2026-04-08",
    decidedDate: "",
    notes: "Shared cost discussion with the CM still open.",
  },
  {
    number: "CO-007",
    title: "Hidden utility relocation at press box",
    description: "Unforeseen duct bank found in the press-box slab edge.",
    type: "Unforeseen",
    amount: 28900,
    status: "Rejected",
    submittedDate: "2026-03-22",
    decidedDate: "2026-04-01",
    notes: "Owner rejected — treat as base-contract unforeseen, not a CO.",
  },
  {
    number: "CO-008",
    title: "ADA ramp realignment at Gate C",
    description: "Owner-directed ramp geometry change after accessibility review.",
    type: "Owner",
    amount: 54600,
    status: "Approved",
    submittedDate: "2026-02-12",
    decidedDate: "2026-02-28",
    notes: "In the executed change package.",
  },
];
