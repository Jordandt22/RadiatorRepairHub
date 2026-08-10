import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";
import {
  buildOutreachSendQueueJobId,
  OUTREACH_DISPATCH_QUEUE_NAME,
  OUTREACH_SEND_QUEUE_NAME,
} from "./constants.js";

let dispatchQueue = null;
let sendQueue = null;

export function getOutreachDispatchQueue() {
  if (!dispatchQueue) {
    dispatchQueue = new Queue(OUTREACH_DISPATCH_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return dispatchQueue;
}

export function getOutreachSendQueue() {
  if (!sendQueue) {
    sendQueue = new Queue(OUTREACH_SEND_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return sendQueue;
}

export async function enqueueOutreachSendJobs(jobs) {
  if (!jobs?.length) return [];
  return getOutreachSendQueue().addBulk(
    jobs.map((job) => ({
      name: "send-outreach-campaign",
      data: {
        runId: job.run_id,
        sendJobId: job.id,
        outreachType: job.outreach_type,
        limitCount: job.limit_count,
      },
      opts: {
        jobId: buildOutreachSendQueueJobId(
          job.run_id,
          job.outreach_type
        ),
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    }))
  );
}

export async function closeOutreachQueues() {
  await Promise.all(
    [dispatchQueue, sendQueue].filter(Boolean).map((queue) => queue.close())
  );
}
