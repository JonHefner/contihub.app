import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ilikeExact } from "./email-match.ts";

describe("ilikeExact", () => {
  test("leaves ordinary emails unchanged", () => {
    assert.equal(ilikeExact("jon.hefner@continentalcando.com"), "jon.hefner@continentalcando.com");
  });

  test("escapes LIKE wildcards so one address cannot match another", () => {
    assert.equal(ilikeExact("a_b%c\\d"), "a\\_b\\%c\\\\d");
  });
});
