export const PROJECT_STATUSES = ["Active", "Bidding", "On Hold", "Closed"] as const;

export type SuiteAppKey = "crm" | "field" | "cost" | "safety" | "trak" | "bid";

export const SUITE_APP_KEYS: SuiteAppKey[] = ["field", "crm", "cost", "safety", "trak", "bid"];

export const SUITE_APP_LABELS: Record<SuiteAppKey, string> = {
  field: "ContiField",
  crm: "ContiCRM",
  cost: "ContiCost",
  safety: "ContiSafety",
  trak: "ContiTraK",
  bid: "Conti Bid",
};

export const SUITE_APP_BLURBS: Record<SuiteAppKey, string> = {
  field: "Daily construction logs and RFIs",
  crm: "Owners, architects, and opportunities",
  cost: "Budget, committed, and actual",
  safety: "Toolbox talks and incidents",
  trak: "Schedule and milestones",
  bid: "Bid chase and proposals",
};

export function projectHref(projectId: string, app?: SuiteAppKey, rest = "") {
  if (!app) {
    return `/app/projects/${projectId}`;
  }
  return `/app/projects/${projectId}/${app}${rest}`;
}

export function fieldBase(projectId: string) {
  return projectHref(projectId, "field");
}

export function isValidProjectStatus(value: string): value is (typeof PROJECT_STATUSES)[number] {
  return PROJECT_STATUSES.includes(value as (typeof PROJECT_STATUSES)[number]);
}

export function suiteAppFromPath(pathname: string): string {
  const nested = pathname.match(/^\/app\/projects\/[^/]+\/([^/]+)/);
  if (nested?.[1]) {
    return nested[1];
  }
  const top = pathname.match(/^\/app\/([^/]+)/);
  return top?.[1] ?? "";
}
