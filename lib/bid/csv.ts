export const CONTRACTOR_CSV_HEADERS = [
  "First",
  "Last",
  "Email",
  "Company",
  "Phone",
  "Office",
  "Cell",
  "Street",
  "City",
  "State",
  "Zip",
  "Categories",
  "Notes",
] as const;

export type ContractorCsvRow = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  office: string;
  cell: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  categories: string;
  notes: string;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function splitCsvRows(text: string) {
  const rows: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        current += '""';
        index += 1;
        continue;
      }
      quoted = !quoted;
      current += char;
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      rows.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) {
    rows.push(current);
  }
  return rows;
}

function headerIndex(headers: string[]) {
  const lookup = new Map(headers.map((header, index) => [header.trim().toLowerCase(), index]));
  return {
    first: lookup.get("first") ?? 0,
    last: lookup.get("last") ?? 1,
    email: lookup.get("email") ?? 2,
    company: lookup.get("company") ?? 3,
    phone: lookup.get("phone") ?? 4,
    office: lookup.get("office") ?? 5,
    cell: lookup.get("cell") ?? 6,
    street: lookup.get("street") ?? 7,
    city: lookup.get("city") ?? 8,
    state: lookup.get("state") ?? 9,
    zip: lookup.get("zip") ?? 10,
    categories: lookup.get("categories") ?? 11,
    notes: lookup.get("notes") ?? 12,
  };
}

function cell(cells: string[], index: number) {
  return (cells[index] ?? "").trim();
}

export function contractorName(firstName: string, lastName: string, company: string) {
  const name = `${firstName} ${lastName}`.trim();
  return name || company || "Contractor";
}

export function parseContractorCsv(text: string): ContractorCsvRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) {
    return [];
  }

  const lines = splitCsvRows(cleaned).filter((line) => line.trim());
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const columns = headerIndex(headers);
  const rows: ContractorCsvRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const row: ContractorCsvRow = {
      firstName: cell(cells, columns.first),
      lastName: cell(cells, columns.last),
      email: cell(cells, columns.email).toLowerCase(),
      company: cell(cells, columns.company),
      phone: cell(cells, columns.phone),
      office: cell(cells, columns.office),
      cell: cell(cells, columns.cell),
      street: cell(cells, columns.street),
      city: cell(cells, columns.city),
      state: cell(cells, columns.state),
      zip: cell(cells, columns.zip),
      categories: cell(cells, columns.categories),
      notes: cell(cells, columns.notes),
    };
    if (!row.email && !row.company && !row.firstName && !row.lastName) {
      continue;
    }
    rows.push(row);
  }

  return rows;
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function contractorsToCsv(rows: ContractorCsvRow[]) {
  const lines = [CONTRACTOR_CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.firstName,
        row.lastName,
        row.email,
        row.company,
        row.phone,
        row.office,
        row.cell,
        row.street,
        row.city,
        row.state,
        row.zip,
        row.categories,
        row.notes,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}
