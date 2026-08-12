import {
  failStaleRunningJobsForBatch,
  getIngestBatch,
  getIngestGroup,
  listIngestBatchesForGroup,
  resetBatchForRetry,
  updateIngestGroup,
} from "./db.js";
import { enqueueEnrichJob, enqueueInsertJob } from "./queues.js";
import { getBatchRetryInfo } from "./retryHelpers.js";

export {
  getBatchRetryInfo,
  isBatchRetryEligible,
  resolveRetryStep,
} from "./retryHelpers.js";

export class IngestRetryError extends Error {
  constructor(message, { status = 400, code = "retry_error" } = {}) {
    super(message);
    this.name = "IngestRetryError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Retry a single ingest batch (enrich or insert).
 * @param {string} batchId
 * @param {{ step?: 'auto' | 'enrich' | 'insert' }} [options]
 */
export async function retryIngestBatch(batchId, { step = "auto" } = {}) {
  const batch = await getIngestBatch(batchId);
  if (!batch) {
    throw new IngestRetryError("Ingest batch not found", {
      status: 404,
      code: "not_found",
    });
  }

  const info = getBatchRetryInfo(batch, { step });
  if (!info.eligible || !info.step) {
    throw new IngestRetryError(info.reason || "Batch cannot be retried", {
      status: 409,
      code: "not_retryable",
    });
  }

  const nextStatus = info.step === "enrich" ? "pending" : "inserting";

  await failStaleRunningJobsForBatch(batchId, {
    code: "superseded_by_retry",
    message: `Superseded by ${info.step} retry`,
  });
  await resetBatchForRetry(batchId, nextStatus);

  const group = await getIngestGroup(batch.group_id);
  if (group && (group.status === "completed" || group.status === "failed")) {
    await updateIngestGroup(batch.group_id, { status: "processing" });
  }

  if (info.step === "enrich") {
    await enqueueEnrichJob(batchId);
  } else {
    await enqueueInsertJob(batchId);
  }

  return {
    batch_id: batchId,
    step: info.step,
    status: nextStatus,
    enqueued: true,
  };
}

/**
 * Retry all eligible failed/stuck batches in a group, sequentially.
 * @param {string} groupId
 */
export async function retryFailedIngestBatchesForGroup(groupId) {
  const group = await getIngestGroup(groupId);
  if (!group) {
    throw new IngestRetryError("Ingest group not found", {
      status: 404,
      code: "not_found",
    });
  }

  const batches = await listIngestBatchesForGroup(groupId);
  const retried = [];
  const skipped = [];

  for (const batch of batches) {
    const info = getBatchRetryInfo(batch);
    if (!info.eligible) {
      skipped.push({
        batch_id: batch.id,
        reason: info.reason || "Not eligible",
      });
      continue;
    }

    try {
      const result = await retryIngestBatch(batch.id, { step: info.step });
      retried.push({ batch_id: result.batch_id, step: result.step });
    } catch (err) {
      skipped.push({
        batch_id: batch.id,
        reason: err?.message || "Retry failed",
      });
    }
  }

  return {
    group_id: groupId,
    retried,
    skipped,
  };
}
