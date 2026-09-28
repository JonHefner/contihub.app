import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CRM_STAGES, crmStageOptions } from "./stages.ts";

describe("Conti CRM stages", () => {
  test("uses Conti chase language and keeps an unknown stored stage selectable", () => {
    assert.deepEqual(CRM_STAGES, ["Lead", "Chase", "Interview", "Award", "Method"]);
    assert.deepEqual(crmStageOptions(["Interview", "Qualified"]), [
      "Lead",
      "Chase",
      "Interview",
      "Award",
      "Method",
      "Qualified",
    ]);
  });
});
