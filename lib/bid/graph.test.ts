import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { graphSendConfig } from "./graph.ts";

describe("graph send config", () => {
  test("lists missing env vars and does not treat a mailbox alone as ready", () => {
    const config = graphSendConfig({
      CONTI_BID_FROM_MAILBOX: "jon.hefner@continentalcando.com",
    } as NodeJS.ProcessEnv);
    assert.equal(config.ready, false);
    assert.deepEqual(config.missing, [
      "MICROSOFT_GRAPH_TENANT_ID",
      "MICROSOFT_GRAPH_CLIENT_ID",
      "MICROSOFT_GRAPH_CLIENT_SECRET",
    ]);
  });
});
