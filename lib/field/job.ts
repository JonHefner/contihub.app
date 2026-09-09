import { DEFAULT_FIELD_JOB } from "@/lib/field/constants";
import { listFieldJobs } from "@/lib/suite/store";
import type { FieldJob, PersistMode } from "@/lib/suite/types";

export async function getActiveFieldJob(): Promise<{ job: FieldJob; persist: PersistMode }> {
  const result = await listFieldJobs();
  return {
    persist: result.persist,
    job: result.rows[0] ?? { id: "", ...DEFAULT_FIELD_JOB },
  };
}
