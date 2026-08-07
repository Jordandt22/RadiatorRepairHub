import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";

export const EMAIL_SCRAPE_QUEUE_NAME = "email-scrape";

let emailScrapeQueue = null;

function connection() {
  return getBullmqConnectionOptions();
}

export function getEmailScrapeQueue() {
  if (!emailScrapeQueue) {
    emailScrapeQueue = new Queue(EMAIL_SCRAPE_QUEUE_NAME, {
      connection: connection(),
    });
  }
  return emailScrapeQueue;
}

export async function enqueueEmailScrapeBatchJob({ batchId, jobId }) {
  return getEmailScrapeQueue().add(
    "email-scrape-batch",
    { batchId, jobId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    }
  );
}

export async function enqueueEmailScrapeBatchJobs(batches) {
  if (!batches.length) return [];

  const queue = getEmailScrapeQueue();
  const jobs = batches.map((batch) => ({
    name: "email-scrape-batch",
    data: { batchId: batch.id, jobId: batch.job_id },
    opts: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    },
  }));

  return queue.addBulk(jobs);
}
