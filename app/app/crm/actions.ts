"use server";

import { revalidatePath } from "next/cache";
import { readRequired, readString } from "@/lib/suite/form";
import { deleteCrmLead, saveCrmLead } from "@/lib/suite/store";

function readLead(formData: FormData) {
  return {
    name: readRequired(formData, "name", "Name"),
    company: readRequired(formData, "company", "Company"),
    stage: readRequired(formData, "stage", "Stage"),
    notes: readString(formData, "notes"),
  };
}

export async function createLead(formData: FormData) {
  await saveCrmLead(readLead(formData));
  revalidatePath("/app/crm");
}

export async function updateLead(id: string, formData: FormData) {
  await saveCrmLead(readLead(formData), id);
  revalidatePath("/app/crm");
}

export async function removeLead(id: string) {
  await deleteCrmLead(id);
  revalidatePath("/app/crm");
}
