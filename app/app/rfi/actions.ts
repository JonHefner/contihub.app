"use server";

import { revalidatePath } from "next/cache";
import {
  cleanRosterEmail,
  cleanTeamsUrl,
  requireCostImpact,
  requireRfiType,
  requireRole,
  requireScheduleImpact,
  requireUrgency,
  type RfiIntent,
} from "@/lib/rfi/pipeline";
import { readString } from "@/lib/suite/form";
import { requireStaff } from "@/lib/suite/org";
import { revalidateSuite } from "@/lib/suite/revalidate";
import { saveRfiDraft, saveRosterSeat, setRosterActive } from "@/lib/suite/rfi-store";

function readIntent(value: string): RfiIntent {
  if (value === "route" || value === "return" || value === "distribute" || value === "close_docs") {
    return value;
  }
  return "save";
}

export async function saveRfiAction(formData: FormData) {
  await requireStaff();
  const projectId = readString(formData, "projectId");
  if (!projectId) {
    throw new Error("Project is required.");
  }
  const number = readString(formData, "number");
  const subject = readString(formData, "subject");
  if (!number) {
    throw new Error("RFI number is required.");
  }
  if (!subject) {
    throw new Error("Subject is required.");
  }
  const returnStatus = readString(formData, "returnStatus");
  const saved = await saveRfiDraft(
    {
      id: readString(formData, "id") || undefined,
      projectId,
      number,
      subject,
      question: readString(formData, "question"),
      improvedQuestion: readString(formData, "improvedQuestion"),
      citations: readString(formData, "citations"),
      docReviewNotes: readString(formData, "docReviewNotes"),
      docsAlreadyAnswer: formData.get("docsAlreadyAnswer") === "yes",
      urgency: requireUrgency(readString(formData, "urgency", "normal")),
      rfiType: requireRfiType(readString(formData, "rfiType", "design_docs")),
      fromName: readString(formData, "fromName"),
      toName: readString(formData, "toName"),
      dateRequired: readString(formData, "dateRequired"),
      costImpact: requireCostImpact(readString(formData, "costImpact", "unknown")),
      scheduleImpact: requireScheduleImpact(readString(formData, "scheduleImpact", "unknown")),
      officialResponse: readString(formData, "officialResponse"),
      returnedAt: readString(formData, "returnedAt"),
      teamsDocsUrl: cleanTeamsUrl(readString(formData, "teamsDocsUrl")),
      outcomes: [0, 1, 2].map((index) => readString(formData, `outcome${index}`)),
      selectedIndex: Number(readString(formData, "selectedIndex", "-1")),
      returnStatus:
        returnStatus === "waiting" || returnStatus === "closed" || returnStatus === "complete" ? returnStatus : undefined,
      contractorIds: formData.getAll("contractorId").map((value) => String(value)),
    },
    readIntent(readString(formData, "intent", "save")),
  );
  revalidateSuite("rfi", projectId);
  revalidatePath("/app");
  revalidatePath(`/app/projects/${projectId}/field/rfis`);
  return { id: saved.item.id, status: saved.item.status };
}

export async function saveRosterAction(formData: FormData) {
  await requireStaff();
  const projectId = readString(formData, "projectId");
  await saveRosterSeat({
    displayName: readString(formData, "displayName"),
    email: cleanRosterEmail(readString(formData, "email")),
    role: requireRole(readString(formData, "role")),
    notes: readString(formData, "notes"),
    projectId: readString(formData, "projectScope") === "project" ? projectId : "",
    active: true,
  });
  revalidateSuite("rfi", projectId || null);
  revalidatePath("/app");
}

export async function setRosterActiveAction(formData: FormData) {
  await requireStaff();
  const id = readString(formData, "id");
  if (!id) {
    throw new Error("Roster seat is required.");
  }
  await setRosterActive(id, formData.get("active") !== "no");
  revalidateSuite("rfi", readString(formData, "projectId") || null);
  revalidatePath("/app");
}
