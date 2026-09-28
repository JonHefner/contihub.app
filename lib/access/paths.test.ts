import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { bidderMayVisit } from "./paths.ts";

describe("bidder paths", () => {
  test("allows only the invitation landing", () => {
    assert.equal(bidderMayVisit("/app/bid/invitations"), true);
    assert.equal(bidderMayVisit("/app/bid/directory"), false);
    assert.equal(bidderMayVisit("/app/projects"), false);
    assert.equal(bidderMayVisit("/app"), false);
  });
});
