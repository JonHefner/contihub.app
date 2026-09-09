import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  BLUE_INNER,
  BLUE_OUTER,
  CC_OPENING_DEG,
  CC_VIEWBOX,
  GOLD_INNER,
  GOLD_OUTER,
  bluePath,
  ccCenter,
  ccMetrics,
  ccPath,
  goldPath,
} from "./cc-mark-geometry.ts";

describe("cc-mark geometry", () => {
  test("gold sits inside the blue C with breathing room and a heavier blue stroke", () => {
    const { center, goldCenter: gold, gap, blueStroke, goldStroke } = ccMetrics();
    assert.equal(center.cx, ccCenter().cx);
    assert.equal(center.cy, CC_VIEWBOX / 2);
    assert.ok(gold.cx > center.cx, "gold should sit slightly toward the opening");
    assert.ok(gold.cy < center.cy, "gold should sit slightly above the drop shadow");
    assert.ok(gap > 3 && gap < 6, `gap ${gap} should leave even breathing room`);
    assert.ok(blueStroke > goldStroke, "blue stroke should be heavier than gold");
    assert.ok(blueStroke / goldStroke > 1.2 && blueStroke / goldStroke < 1.6);
    assert.equal(BLUE_INNER - GOLD_OUTER, gap);
  });

  test("arcs are circles (equal radii) and share one opening angle", () => {
    const blue = bluePath();
    const gold = goldPath();
    const blueRadii = [...blue.matchAll(/A([0-9.]+) \1/g)].map((m) => Number(m[1]));
    const goldRadii = [...gold.matchAll(/A([0-9.]+) \1/g)].map((m) => Number(m[1]));
    assert.deepEqual(blueRadii, [BLUE_OUTER, BLUE_INNER]);
    assert.deepEqual(goldRadii, [GOLD_OUTER, GOLD_INNER]);
    assert.match(blue, /A[\d.]+ [\d.]+ 0 1 0/);
    assert.match(gold, /A[\d.]+ [\d.]+ 0 1 0/);
    assert.equal(CC_OPENING_DEG, 37);
  });

  test("blue C bounding box is optically centered in the square viewBox", () => {
    const { blueBBox, goldBBox, center } = ccMetrics();
    const midX = (blueBBox.left + blueBBox.right) / 2;
    const midY = (blueBBox.top + blueBBox.bottom) / 2;
    assert.ok(Math.abs(midX - CC_VIEWBOX / 2) < 0.05);
    assert.ok(Math.abs(midY - CC_VIEWBOX / 2) < 0.05);
    const leftInnerGap = goldBBox.left - (center.cx - BLUE_INNER);
    const topInnerGap = goldBBox.top - (center.cy - BLUE_INNER);
    assert.ok(leftInnerGap > 2.5 && leftInnerGap < 8, `left inner gap ${leftInnerGap}`);
    assert.ok(topInnerGap > 2.5 && topInnerGap < 6, `top inner gap ${topInnerGap}`);
    assert.ok(goldBBox.right < blueBBox.right);
  });

  test("path helper stays concentric when radii change", () => {
    const center = ccCenter();
    const path = ccPath(20, 10, center);
    assert.ok(path.startsWith("M"));
    assert.ok(path.endsWith("Z"));
    assert.ok(path.includes(`A20 20 0 1 0`));
    assert.ok(path.includes(`A10 10 0 1 1`));
  });
});
