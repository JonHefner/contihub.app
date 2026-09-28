export const CRM_STAGES = ["Lead", "Chase", "Interview", "Award", "Method"] as const;

export type CrmStage = (typeof CRM_STAGES)[number];

export function crmStageOptions(existing: string[]) {
  const extras = existing.filter((stage) => stage && !CRM_STAGES.includes(stage as CrmStage));
  return [...CRM_STAGES, ...new Set(extras)];
}
