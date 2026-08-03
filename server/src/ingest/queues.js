import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "./bullmqRedis.js";

export const QUEUE_NAMES = {
  filter: "ingest-filter",
  enrich: "ingest-enrich",
  insert: "ingest-insert",
};

let filterQueue = null;
let enrichQueue = null;
let insertQueue = null;

function connection() {
  return getBullmqConnectionOptions();
}

export function getFilterQueue() {
  if (!filterQueue) {
    filterQueue = new Queue(QUEUE_NAMES.filter, { connection: connection() });
  }
  return filterQueue;
}

export function getEnrichQueue() {
  if (!enrichQueue) {
    enrichQueue = new Queue(QUEUE_NAMES.enrich, { connection: connection() });
  }
  return enrichQueue;
}

export function getInsertQueue() {
  if (!insertQueue) {
    insertQueue = new Queue(QUEUE_NAMES.insert, { connection: connection() });
  }
  return insertQueue;
}

export async function enqueueFilterJob(groupId) {
  return getFilterQueue().add(
    "filter",
    { groupId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    }
  );
}

export async function enqueueEnrichJob(batchId) {
  return getEnrichQueue().add(
    "enrich",
    { batchId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    }
  );
}

export async function enqueueInsertJob(batchId) {
  return getInsertQueue().add(
    "insert",
    { batchId },
    {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 1,
    }
  );
}
