"use server";

import { revalidatePath } from "next/cache";
import { parseContractorCsv } from "@/lib/bid/csv";
import { readString } from "@/lib/suite/form";
import { deleteContractor, importContractors, saveContractor } from "@/lib/suite/bid-store";
import { requireStaff } from "@/lib/suite/org";

function readContractor(formData: FormData) {
  return {
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    email: readString(formData, "email").toLowerCase(),
    company: readString(formData, "company"),
    phone: readString(formData, "phone"),
    office: readString(formData, "office"),
    cell: readString(formData, "cell"),
    street: readString(formData, "street"),
    city: readString(formData, "city"),
    state: readString(formData, "state"),
    zip: readString(formData, "zip"),
    categories: readString(formData, "categories"),
    notes: readString(formData, "notes"),
    source: "manual" as const,
  };
}

export async function saveDirectoryContractor(formData: FormData, id?: string) {
  await requireStaff();
  const contractor = readContractor(formData);
  if (!contractor.email && !contractor.company && !contractor.firstName) {
    throw new Error("Enter a name, company, or email.");
  }
  await saveContractor(contractor, id);
  revalidatePath("/app/bid/directory");
}

export async function removeContractor(id: string) {
  await requireStaff();
  await deleteContractor(id);
  revalidatePath("/app/bid/directory");
}

export async function importDirectoryCsv(csvText: string) {
  await requireStaff();
  if (csvText.length > 1_500_000) {
    throw new Error("That CSV is too large to import in one pass.");
  }
  const rows = parseContractorCsv(csvText);
  if (rows.length === 0) {
    throw new Error("No contractor rows found. Use the First, Last, Email, Company header row.");
  }
  const result = await importContractors(rows);
  revalidatePath("/app/bid/directory");
  return result;
}
