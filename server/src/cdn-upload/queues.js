import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";

export const CDN_UPLOAD_QUEUE_NAME = "cdn-upload";

let cdnUploadQueue = null;

function connection() {
  return getBullmqConnectionOptions();
}

export function getCdnUploadQueue() {
  if (!cdnUploadQueue) {
    cdnUploadQueue = new Queue(CDN_UPLOAD_QUEUE_NAME, {
      connection: connection(),
    });
  }
  return cdnUploadQueue;
}

export async function enqueueCdnUploadBatchJob({ batchId, jobId }) {
  return getCdnUploadQueue().add(
    "cdn-upload-batch",
    { batchId, jobId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    }
  );
}

export async function enqueueCdnUploadBatchJobs(batches) {
  if (!batches.length) return [];

  const queue = getCdnUploadQueue();
  const jobs = batches.map((batch) => ({
    name: "cdn-upload-batch",
    data: { batchId: batch.id, jobId: batch.job_id },
    opts: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    },
  }));

  return queue.addBulk(jobs);
}
