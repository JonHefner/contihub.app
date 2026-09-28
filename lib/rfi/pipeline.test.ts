import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_ROSTER,
  SAMPLE_RFI,
  buildDistributeDraft,
  buildRouteDraft,
  costPingNote,
  countOpenRfis,
  nextPipelineNumber,
  rosterCorrection,
  routeBlockReason,
  routeRoleForType,
  urgencyTag,
} from "./pipeline.ts";

describe("RFI routing", () => {
  test("sends design and document questions to the architect and owner decisions to the owner", () => {
    assert.equal(routeRoleForType("design_docs"), "architect_liaison");
    assert.equal(routeRoleForType("owner_decision"), "owner_liaison");
    assert.equal(routeRoleForType("other"), "");
  });

  test("tags urgency the way ContiRFI notifies", () => {
    assert.equal(urgencyTag("critical"), "RFI-CRITICAL");
    assert.equal(urgencyTag("high"), "RFI-HIGH");
    assert.equal(urgencyTag("normal"), "RFI-NORMAL");
    assert.equal(urgencyTag("low"), "RFI-LOW");
  });

  test("blocks routing when the documents already answer or the writing is thin", () => {
    assert.match(
      routeBlockReason({
        docsAlreadyAnswer: true,
        docReviewNotes: "quoted",
        citations: "quoted",
        question: "Clearance?",
        improvedQuestion: "Confirm clearance.",
        outcomes: ["Proceed", "Revise"],
        selectedIndex: 0,
        rfiType: "design_docs",
      }) ?? "",
      /Do not route/,
    );
    assert.match(
      routeBlockReason({
        docsAlreadyAnswer: false,
        docReviewNotes: "",
        citations: "",
        question: "Clearance?",
        improvedQuestion: "",
        outcomes: ["Proceed"],
        selectedIndex: -1,
        rfiType: "design_docs",
      }) ?? "",
      /Do not invent/,
    );
    assert.equal(
      routeBlockReason({
        docsAlreadyAnswer: false,
        docReviewNotes: "Staff pasted the note.",
        citations: "Printed label pasted by staff.",
        question: "Clearance?",
        improvedQuestion: "Confirm the working clearance.",
        outcomes: ["Proceed as drawn.", "Revise the detail."],
        selectedIndex: 1,
        rfiType: "design_docs",
      }),
      null,
    );
  });
});

describe("RFI log counts", () => {
  test("counts a pipeline row once and keeps field-only open RFIs", () => {
    const open = countOpenRfis(
      [
        { projectId: "p", number: "RFI-001", status: "routed" },
        { projectId: "p", number: "RFI-002", status: "closed" },
      ],
      [
        { projectId: "p", number: "RFI-001", status: "open" },
        { projectId: "p", number: "RFI-002", status: "open" },
        { projectId: "p", number: "RFI-S01", status: "open" },
        { projectId: "p", number: "RFI-S03", status: "closed" },
      ],
    );
    assert.equal(open, 2);
  });

  test("numbers new Hub RFIs without colliding with SAMPLE field numbers", () => {
    assert.equal(nextPipelineNumber(["RFI-S01", "RFI-004", "RFI-P01"]), "RFI-005");
  });
});

describe("RFI drafts", () => {
  test("route draft carries the urgency tag and refuses invented sheet content", () => {
    const draft = buildRouteDraft({
      number: "RFI-014",
      subject: "Working clearance",
      urgency: "high",
      fromName: "Anne",
      toName: "Ryan Roberts",
      question: "What clearance is required?",
      improvedQuestion: "Confirm the working clearance at the gear.",
      citations: "",
      outcomes: [
        { label: "Proceed as drawn.", selected: false },
        { label: "Revise the detail.", selected: true },
      ],
      costPingNote: costPingNote("unknown"),
    });
    assert.match(draft.subject, /^\[RFI-HIGH\]/);
    assert.match(draft.body, /does not invent drawing citations/);
    assert.match(draft.body, /Revise the detail\. — suggested/);
    assert.match(draft.body, /Do not commit money/);
    assert.doesNotMatch(draft.body, /Sheet [A-Z]/);
  });

  test("distribute draft waits on the logged response", () => {
    const draft = buildDistributeDraft({
      number: "RFI-014",
      subject: "Working clearance",
      urgency: "normal",
      question: "Confirm the working clearance.",
      officialResponse: "Maintain 42 inches. Pad stays.",
      selectedOutcome: "Revise the detail.",
    });
    assert.match(draft.subject, /\[RFI-NORMAL\].*logged/);
    assert.match(draft.body, /Maintain 42 inches/);
    assert.match(draft.body, /superintendent/);
  });
});

describe("deploy roster", () => {
  test("seeds Ann, Michael Might, Ryan Roberts, and Braden with confirmed emails", () => {
    const names = DEFAULT_ROSTER.map((seat) => seat.displayName);
    assert.ok(names.includes("Ann Saccone"));
    assert.ok(names.includes("Michael Might"));
    assert.ok(names.includes("Ryan Roberts"));
    assert.ok(names.includes("Braden Farmer"));
    assert.equal(
      DEFAULT_ROSTER.find((seat) => seat.displayName === "Ann Saccone" && seat.role === "admin")?.email,
      "ann.saccone@continentalcando.com",
    );
    assert.equal(
      DEFAULT_ROSTER.find((seat) => seat.displayName === "Michael Might")?.email,
      "michael.might@continentalcando.com",
    );
    assert.equal(DEFAULT_ROSTER.find((seat) => seat.displayName === "Ryan Roberts")?.role, "architect_liaison");
    assert.equal(
      DEFAULT_ROSTER.find((seat) => seat.displayName === "Ryan Roberts")?.email,
      "ryan.roberts@continentalcando.com",
    );
    assert.equal(
      DEFAULT_ROSTER.find((seat) => seat.displayName === "Braden Farmer")?.email,
      "Braden.Farmer@continentalcando.com",
    );
    assert.equal(DEFAULT_ROSTER.some((seat) => seat.role === "owner_liaison"), false);
    assert.equal(SAMPLE_RFI.toName, "Ryan Roberts");
    assert.match(SAMPLE_RFI.citations, /Not from a drawing set/);
  });

  test("renames the earlier placeholder seats onto the confirmed roster", () => {
    assert.deepEqual(rosterCorrection("admin", "Anne Saccone", "ann.saccone@continentalcando.com"), {
      displayName: "Ann Saccone",
      email: "ann.saccone@continentalcando.com",
      notes: "Admin seat. Add or remove people by setting the roster row inactive.",
    });
    assert.equal(rosterCorrection("superintendent", "Mike", "")?.email, "michael.might@continentalcando.com");
    assert.equal(rosterCorrection("architect_liaison", "Mike Ryan Roberts", "")?.displayName, "Ryan Roberts");
    assert.equal(rosterCorrection("architect_liaison", "Ryan Roberts", "ryan.roberts@continentalcando.com"), null);
    assert.equal(rosterCorrection("superintendent", "Another Mike", "mike@example.com"), null);
  });
});
