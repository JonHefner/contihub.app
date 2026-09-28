"use server";

import { revalidatePath } from "next/cache";
import { isMissingRelation } from "@/lib/suite/db-error";
import { requireUser } from "@/lib/suite/auth";
import { requireStaff } from "@/lib/suite/org";
import { seedSampleWorkspace } from "@/lib/suite/sample-seed";

export async function loadSampleWorkspaceAction() {
  await requireStaff();
  const { supabase } = await requireUser();
  const rpc = await supabase.rpc("seed_full_court_press_sample");
  if (!rpc.error) {
    revalidatePath("/app", "layout");
    return { mode: "sql" as const };
  }
  if (!isMissingRelation(rpc.error)) {
    throw new Error(rpc.error.message);
  }
  await seedSampleWorkspace();
  revalidatePath("/app", "layout");
  return { mode: "app" as const };
}
