import { clearReferenceCache } from "../../redis/redis.js";
import {
  claimBatchJob,
  createIngestJob,
  failIngestJob,
  finishBatchJob,
  getIngestBatch,
  maybeCompleteGroup,
} from "../db.js";
import { insertEnrichedBusinesses } from "../insert.js";

export async function processInsertJob({ batchId }) {
  if (!batchId) {
    throw new Error("insert job missing batchId");
  }

  const batch = await getIngestBatch(batchId);
  if (!batch) {
    throw new Error(`ingest batch not found: ${batchId}`);
  }
  if (!Array.isArray(batch.result_payload)) {
    throw new Error("batch result_payload is invalid (expected enriched data)");
  }

  const job = await createIngestJob({
    groupId: batch.group_id,
    batchId,
    jobType: "insert",
  });

  try {
    await claimBatchJob(batchId, job.id, "inserting");

    const { succeeded, failed } = await insertEnrichedBusinesses(
      batch.result_payload
    );

    if (succeeded.length > 0) {
      await clearReferenceCache();
    }

    await finishBatchJob({
      batchId,
      jobId: job.id,
      jobStatus: "completed",
      batchStatus: succeeded.length > 0 ? "completed" : "failed",
      resultPayload: succeeded,
      failedInsertionPayload: failed,
      updateResultPayload: true,
      updateFailedInsertion: true,
    });

    await maybeCompleteGroup(batch.group_id);

    return {
      batchId,
      jobId: job.id,
      succeeded: succeeded.length,
      failed: failed.length,
    };
  } catch (err) {
    try {
      await finishBatchJob({
        batchId,
        jobId: job.id,
        jobStatus: "failed",
        batchStatus: "failed",
        failedData: {
          code: "insert_failed",
          message: err?.message || "Insert job failed",
        },
      });
    } catch {
      await failIngestJob(job.id, {
        code: "insert_failed",
        message: err?.message || "Insert job failed",
      });
    }
    await maybeCompleteGroup(batch.group_id);
    throw err;
  }
}
