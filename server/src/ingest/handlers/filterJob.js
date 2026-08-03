import {
  chunkArray,
  filterBusinesses,
  INGEST_BATCH_SIZE,
} from "../filter.js";
import {
  completeIngestJob,
  createIngestBatches,
  createIngestJob,
  failIngestJob,
  findExistingPlaceIds,
  getIngestGroup,
  updateIngestGroup,
} from "../db.js";
import { enqueueEnrichJob } from "../queues.js";

export async function processFilterJob({ groupId }) {
  if (!groupId) {
    throw new Error("filter job missing groupId");
  }

  const group = await getIngestGroup(groupId);
  if (!group) {
    throw new Error(`ingest group not found: ${groupId}`);
  }
  if (!Array.isArray(group.payload) || group.payload.length === 0) {
    throw new Error("ingest group payload is empty or invalid");
  }

  await updateIngestGroup(groupId, { status: "filtering" });

  const job = await createIngestJob({
    groupId,
    jobType: "filter",
  });

  try {
    const placeIds = group.payload.map(
      (item) => item?.placeId ?? item?.place_id ?? null,
    );
    const existingPlaceIds = await findExistingPlaceIds(placeIds);
    const { kept, removed } = filterBusinesses(group.payload, {
      existingPlaceIds,
    });

    await updateIngestGroup(groupId, {
      filtered_out_payload: removed,
      status: kept.length > 0 ? "processing" : "completed",
    });

    const chunks = chunkArray(kept, INGEST_BATCH_SIZE);
    const batchRows = chunks.map((chunk) => ({
      group_id: groupId,
      initial_payload: chunk,
      status: "pending",
    }));

    const batches = await createIngestBatches(batchRows);
    await completeIngestJob(job.id);

    for (const batch of batches) {
      await enqueueEnrichJob(batch.id);
    }

    if (batches.length === 0) {
      await updateIngestGroup(groupId, { status: "completed" });
    }

    return {
      groupId,
      jobId: job.id,
      kept: kept.length,
      removed: removed.length,
      batches: batches.length,
    };
  } catch (err) {
    await failIngestJob(job.id, {
      code: "filter_failed",
      message: err?.message || "Filter job failed",
    });
    await updateIngestGroup(groupId, { status: "failed" });
    throw err;
  }
}
