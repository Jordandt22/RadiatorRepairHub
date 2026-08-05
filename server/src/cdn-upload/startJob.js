import { CDN_UPLOAD_BATCH_SIZE } from "./constants.js";
import {
  createCdnUploadBatches,
  createCdnUploadJob,
  selectPendingCdnBusinesses,
} from "./db.js";
import { enqueueCdnUploadBatchJobs } from "./queues.js";

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function startCdnUploadJob({ limitCount = 300 } = {}) {
  const businesses = await selectPendingCdnBusinesses(limitCount);
  const job = await createCdnUploadJob({
    limitCount,
    selectedCount: businesses.length,
  });

  if (businesses.length === 0) {
    return { job, batches: [] };
  }

  const chunks = chunkArray(businesses, CDN_UPLOAD_BATCH_SIZE);
  const batchRows = chunks.map((chunk, index) => ({
    job_id: job.id,
    batch_index: index,
    status: "pending",
    business_ids: chunk.map((business) => business.id),
  }));

  const batches = await createCdnUploadBatches(batchRows);
  await enqueueCdnUploadBatchJobs(batches);

  return { job, batches };
}
