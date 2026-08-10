import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildOutreachIdempotencyKey,
  buildOutreachCronPattern,
  buildOutreachSendQueueJobId,
  OUTREACH_LIMIT_OPTIONS,
  SCHEDULED_OUTREACH_TYPES,
} from "../src/outreach-scheduler/constants.js";
import { UpdateOutreachSchedulerSchema } from "../src/schemas/admin.schemas.js";
import {
  applyOutreachDevelopmentCap,
  getEffectiveOutreachSendLimit,
} from "../src/lib/outreachSend.js";

const validConfig = {
  enabled: true,
  local_time: "08:00",
  timezone: "America/Los_Angeles",
  campaigns: SCHEDULED_OUTREACH_TYPES.map((outreach_type) => ({
    outreach_type,
    enabled: true,
    limit_count: 25,
  })),
};

test("builds a weekday six-field cron pattern", () => {
  assert.equal(buildOutreachCronPattern("08:00"), "0 0 8 * * 1-5");
  assert.equal(buildOutreachCronPattern("14:35"), "0 35 14 * * 1-5");
  assert.throws(() => buildOutreachCronPattern("25:00"));
});

test("builds deterministic child job and Resend idempotency keys", () => {
  assert.equal(
    buildOutreachSendQueueJobId("run-123", "claim_invite"),
    "run-123-claim_invite"
  );
  assert.equal(
    buildOutreachIdempotencyKey("send-job-123"),
    "outreach-send-job-123"
  );
});

test("development outreach batches are capped at two recipients", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    assert.equal(getEffectiveOutreachSendLimit(75), 2);
    const plan = applyOutreachDevelopmentCap({
      skipped: [],
      eligible: [1, 2, 3, 4].map((id) => ({
        business: { id: String(id), title: `Business ${id}` },
        recipient: `${id}@example.com`,
      })),
    });
    assert.deepEqual(
      plan.eligible.map(({ business }) => business.id),
      ["1", "2"]
    );
    assert.equal(plan.skipped.length, 2);
    assert.ok(
      plan.skipped.every(
        (item) => item.reason === "development_send_limit"
      )
    );
  } finally {
    if (previousNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("scheduler schema accepts each supported limit", async () => {
  for (const limit_count of OUTREACH_LIMIT_OPTIONS) {
    const config = {
      ...validConfig,
      campaigns: validConfig.campaigns.map((campaign) => ({
        ...campaign,
        limit_count,
      })),
    };
    await assert.doesNotReject(() =>
      UpdateOutreachSchedulerSchema.validate(config)
    );
  }
});

test("scheduler schema requires all three unique claim invite types", async () => {
  const duplicate = {
    ...validConfig,
    campaigns: validConfig.campaigns.map((campaign, index) => ({
      ...campaign,
      outreach_type:
        index === 2 ? "claim_invite" : campaign.outreach_type,
    })),
  };
  await assert.rejects(() => UpdateOutreachSchedulerSchema.validate(duplicate));
});

test("scheduler schema rejects non-Pacific timezone and invalid time", async () => {
  await assert.rejects(() =>
    UpdateOutreachSchedulerSchema.validate({
      ...validConfig,
      timezone: "UTC",
    })
  );
  await assert.rejects(() =>
    UpdateOutreachSchedulerSchema.validate({
      ...validConfig,
      local_time: "8:00",
    })
  );
});

test("migration serializes reservations and enforces active uniqueness", async () => {
  const migration = await readFile(
    new URL(
      "../../supabase/migrations/20260810053000_scheduled_outreach_email_jobs.sql",
      import.meta.url
    ),
    "utf8"
  );
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(
    migration,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_outreach_send_deliveries_active_business/
  );
  assert.match(migration, /WHERE status IN \('reserved', 'sending'\)/);
  assert.match(migration, /SECURITY INVOKER/);
});
