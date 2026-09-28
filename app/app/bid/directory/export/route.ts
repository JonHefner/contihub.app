import { contractorsToCsv, type ContractorCsvRow } from "@/lib/bid/csv";
import { listContractors } from "@/lib/suite/bid-store";
import { requireStaff } from "@/lib/suite/org";

export async function GET() {
  await requireStaff();
  const { rows } = await listContractors();
  const csvRows: ContractorCsvRow[] = rows.map((row) => ({
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    company: row.company,
    phone: row.phone,
    office: row.office,
    cell: row.cell,
    street: row.street,
    city: row.city,
    state: row.state,
    zip: row.zip,
    categories: row.categories,
    notes: row.notes,
  }));

  return new Response(contractorsToCsv(csvRows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=conti-bid-contractors.csv",
    },
  });
}
