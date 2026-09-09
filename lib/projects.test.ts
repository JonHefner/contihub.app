import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { fieldBase, projectHref, suiteAppFromPath } from "./projects.ts";

describe("projectHref", () => {
  test("builds project home and nested suite URLs", () => {
    assert.equal(projectHref("abc"), "/app/projects/abc");
    assert.equal(projectHref("abc", "field"), "/app/projects/abc/field");
    assert.equal(projectHref("abc", "field", "/log/2026-09-09"), "/app/projects/abc/field/log/2026-09-09");
    assert.equal(fieldBase("abc"), "/app/projects/abc/field");
  });
});

describe("suiteAppFromPath", () => {
  test("treats project home as Projects and nested boards as the suite app", () => {
    assert.equal(suiteAppFromPath("/app"), "");
    assert.equal(suiteAppFromPath("/app/projects"), "projects");
    assert.equal(suiteAppFromPath("/app/projects/abc"), "projects");
    assert.equal(suiteAppFromPath("/app/projects/abc/field"), "field");
    assert.equal(suiteAppFromPath("/app/projects/abc/field/log/2026-09-09"), "field");
    assert.equal(suiteAppFromPath("/app/field"), "field");
    assert.equal(suiteAppFromPath("/app/crm"), "crm");
  });
});
