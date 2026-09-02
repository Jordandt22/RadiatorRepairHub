import test from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_SEND_CHUNK_SIZE,
  expandCampaignsIntoSendChunks,
  getEmailSendChunkOptions,
} from "./emailSendChunks.js";

test("expandCampaignsIntoSendChunks splits campaign limits into 50-email jobs", () => {
  const rows = expandCampaignsIntoSendChunks([
    { digest_segment: "claimed", limit_count: 500, enabled: true },
    { digest_segment: "unclaimed", limit_count: 75, enabled: true },
  ]);

  assert.equal(EMAIL_SEND_CHUNK_SIZE, 50);
  assert.equal(rows.length, 10 + 2);
  assert.deepEqual(
    rows.filter((row) => row.digest_segment === "claimed").map((row) => ({
      chunk_index: row.chunk_index,
      limit_count: row.limit_count,
    })),
    Array.from({ length: 10 }, (_, chunk_index) => ({
      chunk_index,
      limit_count: 50,
    }))
  );
  assert.deepEqual(
    rows
      .filter((row) => row.digest_segment === "unclaimed")
      .map((row) => ({
        chunk_index: row.chunk_index,
        limit_count: row.limit_count,
      })),
    [
      { chunk_index: 0, limit_count: 50 },
      { chunk_index: 1, limit_count: 25 },
    ]
  );
});

test("expandCampaignsIntoSendChunks skips empty limits", () => {
  assert.deepEqual(
    expandCampaignsIntoSendChunks([{ outreach_type: "claim_invite", limit_count: 0 }]),
    []
  );
});

test("expandCampaignsIntoSendChunks supports development 2x2 caps", () => {
  const rows = expandCampaignsIntoSendChunks(
    [{ digest_segment: "claimed", limit_count: 500, enabled: true }],
    { chunkSize: 2, maxChunks: 2 }
  );
  assert.deepEqual(
    rows.map((row) => ({
      chunk_index: row.chunk_index,
      limit_count: row.limit_count,
    })),
    [
      { chunk_index: 0, limit_count: 2 },
      { chunk_index: 1, limit_count: 2 },
    ]
  );
});

test("getEmailSendChunkOptions is stricter in development", () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  assert.deepEqual(getEmailSendChunkOptions(), {
    chunkSize: 2,
    maxChunks: 2,
  });
  process.env.NODE_ENV = "production";
  assert.deepEqual(getEmailSendChunkOptions(), {
    chunkSize: 50,
    maxChunks: null,
  });
  process.env.NODE_ENV = previous;
});
