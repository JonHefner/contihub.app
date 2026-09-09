import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDaysISO, formatFieldShort, isValidISODate, todayISO } from "./dates.ts";

describe("field dates", () => {
  it("formats a local ISO date without UTC shift", () => {
    assert.equal(isValidISODate("2026-09-09"), true);
    assert.equal(isValidISODate("09-09-2026"), false);
    assert.equal(formatFieldShort("2026-09-04"), "Fri Sep 4");
    assert.equal(addDaysISO("2026-09-09", -6), "2026-09-03");
  });

  it("uses the local calendar day for todayISO", () => {
    assert.match(todayISO(new Date(2026, 8, 9, 23, 30)), /^2026-09-09$/);
  });
});
