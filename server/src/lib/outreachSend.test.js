import test from "node:test";
import assert from "node:assert/strict";
import {
  OUTREACH_TYPES,
  buildOutreachEmailPayload,
  evaluateOutreachEligibility,
} from "./outreachSend.js";

test("outreach payload includes unsubscribe footer and List-Unsubscribe headers", () => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-unsubscribe-secret";
  process.env.WEB_BASE_URL = "https://radiatorrepairhub.com";

  const payload = buildOutreachEmailPayload({
    business: {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Acme Radiator",
      slug: "acme-radiator",
      email: "shop@example.com",
      claim_eligibility: "able",
    },
    outreachType: OUTREACH_TYPES.CLAIM_FOLLOWUP,
    recipient: "shop@example.com",
    senderEmail: "hello@radiatorrepairhub.com",
  });

  assert.ok(payload);
  assert.equal(
    payload.headers["List-Unsubscribe-Post"],
    "List-Unsubscribe=One-Click"
  );
  assert.match(
    payload.headers["List-Unsubscribe"],
    /^<https?:\/\/.+\/api\/email\/unsubscribe\?token=/
  );
  assert.match(payload.html, /\/email\/unsubscribe\?token=/);
  assert.match(payload.html, /claim invites, follow-ups, or weekly reports/i);
});

test("evaluateOutreachEligibility honors isSuppressed", () => {
  const result = evaluateOutreachEligibility(
    {
      id: "11111111-1111-1111-1111-111111111111",
      email: "shop@example.com",
      claim_eligibility: "able",
      claim_invite_sent_at: "2026-01-01T00:00:00.000Z",
      claim_followup_sent_at: null,
    },
    OUTREACH_TYPES.CLAIM_FOLLOWUP,
    { isSuppressed: true }
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "suppressed");
});
