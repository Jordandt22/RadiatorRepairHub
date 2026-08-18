import {
  getEmailScrapeBatch,
  listEmailScrapeBatches,
  listOrphanedRunningEmailScrapeBatches,
  markEmailScrapeJobRunning,
  resetEmailScrapeBatchForRetry,
} from "./db.js";
import { enqueueEmailScrapeBatchJob } from "./queues.js";

const RETRYABLE_STATUSES = new Set(["pending", "running", "failed"]);
const STUCK_STATUSES = new Set(["running", "failed"]);

export class EmailScrapeRetryError extends Error {
  constructor(message, { status = 400, code = "retry_error" } = {}) {
    super(message);
    this.name = "EmailScrapeRetryError";
    this.status = status;
    this.code = code;
  }
}

export async function retryEmailScrapeBatch(batchId) {
  const batch = await getEmailScrapeBatch(batchId);
  if (!batch) {
    throw new EmailScrapeRetryError("Email scrape batch not found", {
      status: 404,
      code: "not_found",
    });
  }

  if (!RETRYABLE_STATUSES.has(batch.status)) {
    throw new EmailScrapeRetryError(
      "Only pending, running, or failed batches can be retried",
      { status: 409, code: "not_retryable" }
    );
  }

  const reset = await resetEmailScrapeBatchForRetry(batch.id);
  if (!reset) {
    throw new EmailScrapeRetryError("Email scrape batch could not be reset", {
      status: 409,
      code: "not_retryable",
    });
  }

  await markEmailScrapeJobRunning(batch.job_id);
  await enqueueEmailScrapeBatchJob({
    batchId: batch.id,
    jobId: batch.job_id,
  });

  return {
    batch_id: batch.id,
    job_id: batch.job_id,
    status: reset.status,
    enqueued: true,
  };
}

export async function retryStuckEmailScrapeBatchesForJob(jobId) {
  const batches = await listEmailScrapeBatches(jobId);
  const retried = [];
  const skipped = [];

  for (const batch of batches) {
    if (!STUCK_STATUSES.has(batch.status)) {
      skipped.push({
        batch_id: batch.id,
        reason: batch.status === "pending" ? "Still pending" : "Not retryable",
      });
      continue;
    }

    try {
      retried.push(await retryEmailScrapeBatch(batch.id));
    } catch (err) {
      skipped.push({
        batch_id: batch.id,
        reason: err?.message || "Retry failed",
      });
    }
  }

  return { job_id: jobId, retried, skipped };
}

export async function reconcileOrphanedEmailScrapeBatches() {
  const orphans = await listOrphanedRunningEmailScrapeBatches();
  const retried = [];

  for (const batch of orphans) {
    retried.push(await retryEmailScrapeBatch(batch.id));
  }

  return retried;
}
