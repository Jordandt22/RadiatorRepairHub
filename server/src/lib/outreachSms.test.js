import test from "node:test";
import assert from "node:assert/strict";
import {
  OUTREACH_TYPES,
  buildOutreachSmsContent,
  evaluateOutreachSmsDeclineEligibility,
  evaluateOutreachSmsEligibility,
} from "./outreachSend.js";

const phoneAbleBusiness = (overrides = {}) => ({
  id: "11111111-1111-1111-1111-111111111111",
  title: "Acme Radiator",
  slug: "acme-radiator",
  phone: "(602) 555-0134",
  city_name: "Phoenix",
  state_code: "AZ",
  claim_eligibility: "phone_able",
  sms_claim_invite_sent_at: null,
  sms_claim_followup_sent_at: null,
  sms_declined_at: null,
  ...overrides,
});

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

test("sms invite is eligible for phone_able and both_able listings", () => {
  for (const eligibility of ["phone_able", "both_able"]) {
    const result = evaluateOutreachSmsEligibility(
      phoneAbleBusiness({ claim_eligibility: eligibility }),
      OUTREACH_TYPES.SMS_CLAIM_INVITE
    );
    assert.equal(result.ok, true, eligibility);
    assert.equal(result.recipient, "(602) 555-0134");
  }
});

test("sms invite skips email-only and unreachable listings", () => {
  for (const eligibility of ["email_able", "phone_review", "no_contact"]) {
    const result = evaluateOutreachSmsEligibility(
      phoneAbleBusiness({ claim_eligibility: eligibility }),
      OUTREACH_TYPES.SMS_CLAIM_INVITE
    );
    assert.equal(result.ok, false, eligibility);
    assert.equal(result.reason, `eligibility_${eligibility}`);
  }
});

test("email invite history does not block an sms invite", () => {
  const result = evaluateOutreachSmsEligibility(
    phoneAbleBusiness({ claim_invite_sent_at: daysAgo(1) }),
    OUTREACH_TYPES.SMS_CLAIM_INVITE
  );
  assert.equal(result.ok, true);
});

test("sms invite is only sent once per business, standard or custom", () => {
  for (const type of [
    OUTREACH_TYPES.SMS_CLAIM_INVITE,
    OUTREACH_TYPES.SMS_CUSTOM_CLAIM_INVITE,
  ]) {
    const result = evaluateOutreachSmsEligibility(
      phoneAbleBusiness({ sms_claim_invite_sent_at: daysAgo(1) }),
      type
    );
    assert.equal(result.ok, false, type);
    assert.equal(result.reason, "already_sent");
  }
});

test("custom sms invite is allowed when nothing has been texted yet", () => {
  const result = evaluateOutreachSmsEligibility(
    phoneAbleBusiness(),
    OUTREACH_TYPES.SMS_CUSTOM_CLAIM_INVITE
  );
  assert.equal(result.ok, true);
});

test("sms follow-up requires an sms invite that is at least 7 days old", () => {
  const noInvite = evaluateOutreachSmsEligibility(
    phoneAbleBusiness(),
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.equal(noInvite.reason, "claim_invite_not_sent");

  const tooRecent = evaluateOutreachSmsEligibility(
    phoneAbleBusiness({ sms_claim_invite_sent_at: daysAgo(2) }),
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.equal(tooRecent.reason, "claim_invite_too_recent");

  const ready = evaluateOutreachSmsEligibility(
    phoneAbleBusiness({ sms_claim_invite_sent_at: daysAgo(8) }),
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.equal(ready.ok, true);

  const alreadySent = evaluateOutreachSmsEligibility(
    phoneAbleBusiness({
      sms_claim_invite_sent_at: daysAgo(30),
      sms_claim_followup_sent_at: daysAgo(2),
    }),
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.equal(alreadySent.reason, "already_sent");
});

test("declined shops are blocked from all sms campaigns", () => {
  const result = evaluateOutreachSmsEligibility(
    phoneAbleBusiness({
      sms_declined_at: daysAgo(1),
      sms_claim_invite_sent_at: daysAgo(10),
    }),
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "declined");
});

test("sms decline can be recorded once", () => {
  const ok = evaluateOutreachSmsDeclineEligibility(phoneAbleBusiness());
  assert.equal(ok.ok, true);

  const again = evaluateOutreachSmsDeclineEligibility(
    phoneAbleBusiness({ sms_declined_at: daysAgo(1) })
  );
  assert.equal(again.reason, "already_declined");
});

test("sms eligibility rejects email-only campaign types", () => {
  const result = evaluateOutreachSmsEligibility(
    phoneAbleBusiness(),
    OUTREACH_TYPES.WEBSITE_OFFER
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_outreach_type");
});

test("sms invite body includes the business name and listing link", () => {
  const content = buildOutreachSmsContent(
    phoneAbleBusiness(),
    OUTREACH_TYPES.SMS_CLAIM_INVITE
  );
  assert.match(content.body, /Acme Radiator/);
  assert.match(content.body, /\/business\/acme-radiator/);
  assert.doesNotMatch(content.body, /Phoenix, AZ/);
  assert.doesNotMatch(content.body, /Reply STOP/i);
  assert.doesNotMatch(content.body, /<[a-z]/i);
});

test("sms follow-up body is shorter than the invite", () => {
  const business = phoneAbleBusiness();
  const invite = buildOutreachSmsContent(
    business,
    OUTREACH_TYPES.SMS_CLAIM_INVITE
  );
  const followup = buildOutreachSmsContent(
    business,
    OUTREACH_TYPES.SMS_CLAIM_FOLLOWUP
  );
  assert.ok(followup.body.length < invite.body.length);
  assert.match(followup.body, /\/business\/acme-radiator/);
  assert.doesNotMatch(followup.body, /Reply STOP/i);
});
