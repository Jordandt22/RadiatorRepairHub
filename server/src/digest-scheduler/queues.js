import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";
import {
  buildDigestSendQueueJobId,
  DIGEST_DISPATCH_QUEUE_NAME,
  DIGEST_SEND_QUEUE_NAME,
} from "./constants.js";

let dispatchQueue = null;
let sendQueue = null;

export function getDigestDispatchQueue() {
  if (!dispatchQueue) {
    dispatchQueue = new Queue(DIGEST_DISPATCH_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return dispatchQueue;
}

export function getDigestSendQueue() {
  if (!sendQueue) {
    sendQueue = new Queue(DIGEST_SEND_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return sendQueue;
}

export async function enqueueDigestSendJobs(jobs) {
  if (!jobs?.length) return [];
  return getDigestSendQueue().addBulk(
    jobs.map((job) => ({
      name: "send-digest-campaign",
      data: {
        runId: job.run_id,
        sendJobId: job.id,
        digestSegment: job.digest_segment,
        limitCount: job.limit_count,
        chunkIndex: job.chunk_index ?? 0,
      },
      opts: {
        jobId: buildDigestSendQueueJobId(
          job.run_id,
          job.digest_segment,
          job.chunk_index ?? 0
        ),
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    }))
  );
}

export async function closeDigestQueues() {
  await Promise.all(
    [dispatchQueue, sendQueue].filter(Boolean).map((queue) => queue.close())
  );
}
