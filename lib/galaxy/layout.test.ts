import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { GALAXY_ROUTES, filterGalaxyNodes, galaxyNodes, hitTest } from "./layout.ts";

describe("galaxy layout", () => {
  test("hub sits at the origin and every id is unique", () => {
    const nodes = galaxyNodes();
    const hub = nodes.find((item) => item.id === "hub");
    assert.ok(hub);
    assert.equal(hub.x, 0);
    assert.equal(hub.y, 0);
    assert.equal(hub.kind, "hub");
    assert.equal(new Set(nodes.map((item) => item.id)).size, nodes.length);
  });

  test("every node opens an existing suite route or the invite panel", () => {
    const allowed = new Set<string>(GALAXY_ROUTES);
    for (const item of galaxyNodes()) {
      if (item.id === "invite") {
        assert.equal(item.href, "");
        assert.equal(item.kind, "team");
        continue;
      }
      assert.ok(allowed.has(item.href), item.href);
    }
    assert.ok(galaxyNodes().some((item) => item.href === "/app/rfi" && item.name === "ContiReview"));
    assert.ok(galaxyNodes().some((item) => item.id === "trak" && /not a CPM/i.test(item.description)));
  });

  test("cluster and search filters keep the hub", () => {
    const nodes = galaxyNodes();
    const bid = filterGalaxyNodes(nodes, "", "Bid").map((item) => item.id);
    assert.deepEqual(bid.sort(), ["bid", "directory", "hub"]);
    const review = filterGalaxyNodes(nodes, "contireview", "All").map((item) => item.id);
    assert.deepEqual(review.sort(), ["hub", "rfi"]);
  });

  test("hit testing prefers the smaller node and misses empty space", () => {
    const nodes = galaxyNodes();
    assert.equal(hitTest(nodes, 0, 0)?.id, "hub");
    assert.equal(hitTest(nodes, 4000, 4000), null);
    const projects = nodes.find((item) => item.id === "projects");
    assert.ok(projects);
    assert.equal(hitTest(nodes, projects.x, projects.y)?.id, "projects");
  });
});
