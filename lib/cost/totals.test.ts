import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { summarizeCostLines } from "./totals.ts";

describe("cost totals", () => {
  test("rolls up the SAMPLE Data Center lines", () => {
    const totals = summarizeCostLines([
      { budget: 2400000, committed: 1800000, actual: 900000 },
      { budget: 6100000, committed: 4200000, actual: 1100000 },
      { budget: 8900000, committed: 2100000, actual: 400000 },
      { budget: 7600000, committed: 1500000, actual: 250000 },
    ]);
    assert.equal(totals.budget, 25000000);
    assert.equal(totals.committed, 9600000);
    assert.equal(totals.actual, 2650000);
    assert.equal(totals.variance, 22350000);
  });
});
