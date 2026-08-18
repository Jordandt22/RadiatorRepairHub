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

const EMAIL_SCRAPE_JOB_OPTS = {
  removeOnComplete: 100,
  removeOnFail: 200,
  attempts: 2,
};

export async function enqueueEmailScrapeBatchJob({ batchId, jobId }) {
  return getEmailScrapeQueue().add(
    "email-scrape-batch",
    { batchId, jobId },
    EMAIL_SCRAPE_JOB_OPTS
  );
}

export async function enqueueEmailScrapeBatchJobs(batches) {
  if (!batches.length) return [];

  const queue = getEmailScrapeQueue();
  const jobs = batches.map((batch) => ({
    name: "email-scrape-batch",
    data: { batchId: batch.id, jobId: batch.job_id },
    opts: EMAIL_SCRAPE_JOB_OPTS,
  }));

  return queue.addBulk(jobs);
}

export async function closeEmailScrapeQueue() {
  if (!emailScrapeQueue) return;
  await emailScrapeQueue.close();
  emailScrapeQueue = null;
}
