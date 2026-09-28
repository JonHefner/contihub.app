import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { buildBidInviteEmail, safeHttpUrl } from "./invite-email.ts";

describe("bid invite email", () => {
  test("includes access, magic link, drawings, and the Building Connected note", () => {
    const email = buildBidInviteEmail({
      projectName: "SAMPLE Data Center",
      packageTitle: "Early site",
      dueLabel: "Oct 12, 2026 15:00",
      trade: "Earthwork",
      username: "bids@example.com",
      magicLink: "https://example.supabase.co/auth/v1/verify?token=abc",
      drawingsUrl: "https://teams.microsoft.com/l/channel/drawings",
      fromMailbox: "jon.hefner@continentalcando.com",
      buildingConnectedSent: true,
    });

    assert.match(email.subject, /Conti Bid invitation/);
    assert.match(email.subject, /SAMPLE Data Center/);
    assert.match(email.text, /Username: bids@example.com/);
    assert.match(email.text, /https:\/\/example.supabase.co\/auth\/v1\/verify/);
    assert.match(email.text, /teams.microsoft.com/);
    assert.match(email.text, /Building Connected/);
    assert.match(email.text, /does not replace/);
    assert.match(email.html, /Open Conti Bid/);
    assert.match(email.html, /bids@example.com/);
    assert.match(email.mailto, /^mailto:/);
    assert.equal(safeHttpUrl("javascript:alert(1)"), "");
  });

  test("escapes html in the project name", () => {
    const email = buildBidInviteEmail({
      projectName: "<script>",
      packageTitle: "Package",
      dueLabel: "",
      trade: "Concrete",
      username: "a@example.com",
      magicLink: null,
      drawingsUrl: "",
      fromMailbox: "",
      buildingConnectedSent: false,
    });
    assert.equal(email.html.includes("<script>"), false);
    assert.match(email.html, /&lt;script&gt;/);
    assert.match(email.text, /no temporary password|magic link was not minted/i);
  });
});
