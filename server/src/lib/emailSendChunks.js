/** Max emails per BullMQ send job / Resend batch.send call. */
export const EMAIL_SEND_CHUNK_SIZE = 50;

/** Dev: at most this many send jobs per campaign. */
export const DEVELOPMENT_EMAIL_SEND_MAX_JOBS = 2;

/** Dev: at most this many reserved/sent emails per send job. */
export const DEVELOPMENT_EMAIL_SEND_PER_JOB = 2;

/**
 * Expand campaign configs into per-chunk send jobs.
 * Example: limit 500 → 10 chunks of 50; limit 75 → 50 + 25.
 */
export function expandCampaignsIntoSendChunks(
  campaigns,
  { chunkSize = EMAIL_SEND_CHUNK_SIZE, maxChunks = null } = {}
) {
  const size = Math.max(1, Number(chunkSize) || EMAIL_SEND_CHUNK_SIZE);
  const chunkCap =
    maxChunks == null ? null : Math.max(1, Number(maxChunks) || 1);
  const rows = [];

  for (const campaign of campaigns ?? []) {
    const total = Math.max(0, Number(campaign.limit_count) || 0);
    if (total < 1) continue;

    let remaining = total;
    let chunkIndex = 0;
    while (remaining > 0) {
      if (chunkCap != null && chunkIndex >= chunkCap) break;
      const limitCount = Math.min(size, remaining);
      rows.push({
        ...campaign,
        limit_count: limitCount,
        chunk_index: chunkIndex,
      });
      remaining -= limitCount;
      chunkIndex += 1;
    }
  }

  return rows;
}

/** Chunk options for the current environment (stricter in development). */
export function getEmailSendChunkOptions() {
  if (process.env.NODE_ENV === "development") {
    return {
      chunkSize: DEVELOPMENT_EMAIL_SEND_PER_JOB,
      maxChunks: DEVELOPMENT_EMAIL_SEND_MAX_JOBS,
    };
  }
  return {
    chunkSize: EMAIL_SEND_CHUNK_SIZE,
    maxChunks: null,
  };
}
