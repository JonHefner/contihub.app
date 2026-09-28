import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  SAMPLE_CHANGE_ORDERS,
  nextChangeOrderNumber,
  normalizeChangeOrderAmount,
  summarizeChangeOrders,
} from "./change-orders.ts";
import { readSignedMoney } from "./suite/form.ts";

describe("summarizeChangeOrders", () => {
  test("splits pending vs approved and excludes rejected from owner exposure", () => {
    const summary = summarizeChangeOrders(SAMPLE_CHANGE_ORDERS);

    assert.equal(summary.count, 8);
    assert.equal(summary.proposedTotal, 226250);
    assert.equal(summary.pricingTotal, 167400);
    assert.equal(summary.pendingTotal, 393650);
    assert.equal(summary.approvedTotal, 282900);
    assert.equal(summary.rejectedTotal, 28900);
    assert.equal(summary.netOwnerExposure, 676550);
    assert.equal(summary.pendingCount, 4);
    assert.equal(summary.approvedCount, 3);
  });

  test("treats deducts as negative exposure", () => {
    const summary = summarizeChangeOrders([
      { amount: 10000, status: "Approved" },
      { amount: -2500, status: "Approved" },
      { amount: 4000, status: "Proposed" },
    ]);

    assert.equal(summary.approvedTotal, 7500);
    assert.equal(summary.pendingTotal, 4000);
    assert.equal(summary.netOwnerExposure, 11500);
  });
});

describe("normalizeChangeOrderAmount", () => {
  test("flips a positive deduct to a credit", () => {
    assert.equal(normalizeChangeOrderAmount("Deduct", 18500), -18500);
    assert.equal(normalizeChangeOrderAmount("Deduct", -18500), -18500);
    assert.equal(normalizeChangeOrderAmount("Owner", 18500), 18500);
  });
});

describe("nextChangeOrderNumber", () => {
  test("increments the highest trailing number", () => {
    assert.equal(nextChangeOrderNumber([]), "CO-001");
    assert.equal(nextChangeOrderNumber(SAMPLE_CHANGE_ORDERS), "CO-009");
    assert.equal(nextChangeOrderNumber([{ number: "COR 12" }]), "CO-013");
  });
});

describe("readSignedMoney", () => {
  test("keeps deducts negative", () => {
    const form = new FormData();
    form.set("amount", "-18500.25");
    assert.equal(readSignedMoney(form, "amount", "Amount"), -18500.25);
  });
});
