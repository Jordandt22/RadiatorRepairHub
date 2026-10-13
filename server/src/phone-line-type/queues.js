import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";

export const PHONE_LINE_TYPE_QUEUE_NAME = "phone-line-type";

let phoneLineTypeQueue = null;

function connection() {
  return getBullmqConnectionOptions();
}

export function getPhoneLineTypeQueue() {
  if (!phoneLineTypeQueue) {
    phoneLineTypeQueue = new Queue(PHONE_LINE_TYPE_QUEUE_NAME, {
      connection: connection(),
    });
  }
  return phoneLineTypeQueue;
}

export async function closePhoneLineTypeQueue() {
  if (!phoneLineTypeQueue) return;
  await phoneLineTypeQueue.close();
  phoneLineTypeQueue = null;
}

export async function enqueuePhoneLineTypeJob(jobId) {
  return getPhoneLineTypeQueue().add(
    "phone-line-type-job",
    { jobId },
    {
      jobId,
      removeOnComplete: 20,
      removeOnFail: 50,
      attempts: 2,
      backoff: { type: "fixed", delay: 5000 },
    }
  );
}
