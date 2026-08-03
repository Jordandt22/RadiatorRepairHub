import "dotenv/config";
import { Worker } from "bullmq";
import { getBullmqConnectionOptions } from "./ingest/bullmqRedis.js";
import { QUEUE_NAMES } from "./ingest/queues.js";
import { processFilterJob } from "./ingest/handlers/filterJob.js";
import { processEnrichJob } from "./ingest/handlers/enrichJob.js";
import { processInsertJob } from "./ingest/handlers/insertJob.js";

const connection = getBullmqConnectionOptions();

const filterWorker = new Worker(
  QUEUE_NAMES.filter,
  async (job) => processFilterJob(job.data),
  { connection, concurrency: 1 }
);

const enrichWorker = new Worker(
  QUEUE_NAMES.enrich,
  async (job) => processEnrichJob(job.data),
  { connection, concurrency: 2 }
);

const insertWorker = new Worker(
  QUEUE_NAMES.insert,
  async (job) => processInsertJob(job.data),
  { connection, concurrency: 1 }
);

function attachLogging(worker, label) {
  worker.on("completed", (job, result) => {
    console.log(`[${label}] completed ${job.id}`, result);
  });
  worker.on("failed", (job, err) => {
    console.error(`[${label}] failed ${job?.id}:`, err?.message || err);
  });
}

attachLogging(filterWorker, "ingest-filter");
attachLogging(enrichWorker, "ingest-enrich");
attachLogging(insertWorker, "ingest-insert");

console.log(
  "Ingest worker listening:",
  Object.values(QUEUE_NAMES).join(", ")
);

async function shutdown() {
  console.log("Shutting down ingest worker...");
  await Promise.all([
    filterWorker.close(),
    enrichWorker.close(),
    insertWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
