import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { contractorsToCsv, parseContractorCsv } from "./csv.ts";
import { SAMPLE_CONTRACTORS } from "./sample-contractors.ts";

describe("contractor csv", () => {
  test("parses quoted companies and the Conti header row", () => {
    const csv = contractorsToCsv(SAMPLE_CONTRACTORS);
    const rows = parseContractorCsv(csv);
    assert.equal(rows.length, SAMPLE_CONTRACTORS.length);
    assert.equal(rows[3].company, "Phoenix Cement Contracting, LLC");
    assert.equal(rows[0].email, "jfb@raybertolini.com");
    assert.match(rows[0].notes, /SAMPLE/);
    assert.match(rows[0].categories, /Earthwork/);
  });

  test("keeps commas inside quoted company and notes", () => {
    const rows = parseContractorCsv(
      contractorsToCsv([
        {
          firstName: "A",
          lastName: "B",
          email: "a@example.com",
          company: "Smith, LLC",
          phone: "",
          office: "",
          cell: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          categories: "Earthwork",
          notes: "Earthwork, concrete",
        },
      ]),
    );
    assert.equal(rows[0].company, "Smith, LLC");
    assert.equal(rows[0].notes, "Earthwork, concrete");
  });
});
