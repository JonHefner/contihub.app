"use server";

import { readRequired, readString } from "@/lib/suite/form";
import { readProjectId, revalidateSuite } from "@/lib/suite/revalidate";
import { deleteCrmLead, saveCrmLead } from "@/lib/suite/store";

function readLead(formData: FormData) {
  return {
    projectId: readProjectId(formData) ?? "",
    name: readRequired(formData, "name", "Name"),
    company: readRequired(formData, "company", "Company"),
    stage: readRequired(formData, "stage", "Stage"),
    notes: readString(formData, "notes"),
  };
}

export async function createLead(formData: FormData) {
  const lead = readLead(formData);
  await saveCrmLead(lead);
  revalidateSuite("crm", lead.projectId);
}

export async function updateLead(id: string, formData: FormData) {
  const lead = readLead(formData);
  await saveCrmLead(lead, id);
  revalidateSuite("crm", lead.projectId);
}

export async function removeLead(id: string) {
  await deleteCrmLead(id);
  revalidateSuite("crm");
}
