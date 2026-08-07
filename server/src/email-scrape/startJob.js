import { EMAIL_SCRAPE_BATCH_SIZE } from "./constants.js";
import {
  createEmailScrapeBatches,
  createEmailScrapeJob,
  selectPendingEmailScrapeBusinesses,
} from "./db.js";
import { enqueueEmailScrapeBatchJobs } from "./queues.js";

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function startEmailScrapeJob({ limitCount = 300 } = {}) {
  const businesses = await selectPendingEmailScrapeBusinesses(limitCount);
  const job = await createEmailScrapeJob({
    limitCount,
    selectedCount: businesses.length,
  });

  if (businesses.length === 0) {
    return { job, batches: [] };
  }

  const chunks = chunkArray(businesses, EMAIL_SCRAPE_BATCH_SIZE);
  const batchRows = chunks.map((chunk, index) => ({
    job_id: job.id,
    batch_index: index,
    status: "pending",
    business_ids: chunk.map((business) => business.id),
  }));

  const batches = await createEmailScrapeBatches(batchRows);
  await enqueueEmailScrapeBatchJobs(batches);

  return { job, batches };
}
