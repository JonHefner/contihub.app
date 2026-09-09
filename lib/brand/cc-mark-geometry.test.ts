import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  BLUE_INNER,
  BLUE_OUTER,
  CC_OPENING_DEG,
  CC_VIEWBOX,
  GOLD_INNER,
  GOLD_OFFSET_X,
  GOLD_OUTER,
  bluePath,
  ccCenter,
  ccMetrics,
  ccPath,
  goldPath,
} from "./cc-mark-geometry.ts";

describe("cc-mark geometry", () => {
  test("gold is nested in the blue C with ContiCost-like stroke and gap", () => {
    const { center, goldCenter: gold, gap, blueStroke, goldStroke } = ccMetrics();
    assert.equal(center.cx, ccCenter().cx);
    assert.equal(center.cy, CC_VIEWBOX / 2);
    assert.ok(gold.cx >= center.cx, "gold may sit slightly toward the opening");
    assert.ok(GOLD_OFFSET_X < 1, "gold must not sit in the mouth");
    assert.equal(gold.cy, center.cy);
    assert.ok(gap > 3.5 && gap < 5.5, `gap ${gap}`);
    assert.ok(blueStroke > goldStroke, "blue stroke should be heavier than gold");
    assert.ok(blueStroke / goldStroke > 1.15 && blueStroke / goldStroke < 1.4);
    assert.equal(BLUE_INNER - GOLD_OUTER, gap);
  });

  test("arcs are circles and share one opening angle", () => {
    const blue = bluePath();
    const gold = goldPath();
    const blueRadii = [...blue.matchAll(/A([0-9.]+) \1/g)].map((m) => Number(m[1]));
    const goldRadii = [...gold.matchAll(/A([0-9.]+) \1/g)].map((m) => Number(m[1]));
    assert.deepEqual(blueRadii, [BLUE_OUTER, BLUE_INNER]);
    assert.deepEqual(goldRadii, [GOLD_OUTER, GOLD_INNER]);
    assert.match(blue, /A[\d.]+ [\d.]+ 0 1 0/);
    assert.match(gold, /A[\d.]+ [\d.]+ 0 1 0/);
    assert.equal(CC_OPENING_DEG, 28);
  });

  test("blue C bounding box is centered and gold stays inside it", () => {
    const { blueBBox, goldBBox, center } = ccMetrics();
    const midX = (blueBBox.left + blueBBox.right) / 2;
    const midY = (blueBBox.top + blueBBox.bottom) / 2;
    assert.ok(Math.abs(midX - CC_VIEWBOX / 2) < 0.05);
    assert.ok(Math.abs(midY - CC_VIEWBOX / 2) < 0.05);
    const leftInnerGap = goldBBox.left - (center.cx - BLUE_INNER);
    const topInnerGap = goldBBox.top - (center.cy - BLUE_INNER);
    const botInnerGap = center.cy + BLUE_INNER - goldBBox.bottom;
    assert.ok(leftInnerGap > 3 && leftInnerGap < 6, `left inner gap ${leftInnerGap}`);
    assert.ok(Math.abs(topInnerGap - botInnerGap) < 0.05, "vertical gold padding should match");
    assert.ok(goldBBox.right < blueBBox.right);
  });

  test("path helper stays circular when radii change", () => {
    const center = ccCenter();
    const path = ccPath(20, 10, center);
    assert.ok(path.startsWith("M"));
    assert.ok(path.endsWith("Z"));
    assert.ok(path.includes(`A20 20 0 1 0`));
    assert.ok(path.includes(`A10 10 0 1 1`));
  });
});
