import { enrichBusinesses } from "../enrich.js";
import {
  claimBatchJob,
  createIngestJob,
  failIngestJob,
  finishBatchJob,
  getIngestBatch,
  maybeCompleteGroup,
} from "../db.js";
import { enqueueInsertJob } from "../queues.js";

export async function processEnrichJob({ batchId }) {
  if (!batchId) {
    throw new Error("enrich job missing batchId");
  }

  const batch = await getIngestBatch(batchId);
  if (!batch) {
    throw new Error(`ingest batch not found: ${batchId}`);
  }
  if (!Array.isArray(batch.initial_payload)) {
    throw new Error("batch initial_payload is invalid");
  }

  const job = await createIngestJob({
    groupId: batch.group_id,
    batchId,
    jobType: "enrich",
  });

  try {
    await claimBatchJob(batchId, job.id, "enriching");

    const { succeeded, failed } = await enrichBusinesses(batch.initial_payload);

    if (succeeded.length === 0) {
      await finishBatchJob({
        batchId,
        jobId: job.id,
        jobStatus: "completed",
        batchStatus: "failed",
        resultPayload: [],
        failedEnrichmentPayload: failed,
        updateResultPayload: true,
        updateFailedEnrichment: true,
      });
      await maybeCompleteGroup(batch.group_id);
      return { batchId, jobId: job.id, succeeded: 0, failed: failed.length };
    }

    await finishBatchJob({
      batchId,
      jobId: job.id,
      jobStatus: "completed",
      batchStatus: "inserting",
      resultPayload: succeeded,
      failedEnrichmentPayload: failed,
      updateResultPayload: true,
      updateFailedEnrichment: true,
    });

    await enqueueInsertJob(batchId);

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
          code: "enrich_failed",
          message: err?.message || "Enrich job failed",
        },
      });
    } catch {
      await failIngestJob(job.id, {
        code: "enrich_failed",
        message: err?.message || "Enrich job failed",
      });
    }
    await maybeCompleteGroup(batch.group_id);
    throw err;
  }
}
