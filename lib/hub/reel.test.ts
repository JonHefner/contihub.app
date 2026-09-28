import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { hubTiles } from "../apps.ts";
import { ringOffset, wrapIndex } from "./reel.ts";

describe("hub tile reel", () => {
  test("keeps today's tiles and adds ContiReview and Change Orders", () => {
    const ids = hubTiles.map((tile) => tile.id);
    assert.deepEqual(ids, [
      "contihub",
      "projects",
      "conticrm",
      "contifield",
      "conticost",
      "contisafety",
      "contitrak",
      "contibid",
      "contireview",
      "changeorders",
    ]);
    assert.equal(hubTiles.find((tile) => tile.id === "contireview")?.href, "/app/rfi");
    assert.equal(hubTiles.find((tile) => tile.id === "changeorders")?.href, "/app/change-orders");
    assert.equal(new Set(hubTiles.map((tile) => tile.href)).size, hubTiles.length);
  });

  test("wraps neighbors around the ring", () => {
    assert.equal(ringOffset(1, 0, 10), 1);
    assert.equal(ringOffset(9, 0, 10), -1);
    assert.ok(Math.abs(ringOffset(0, 0.4, 10) + 0.4) < 1e-9);
    assert.equal(wrapIndex(-1, 10), 9);
    assert.ok(Math.abs(wrapIndex(10.2, 10) - 0.2) < 1e-9);
  });
});
