import "dotenv/config";
import { Worker } from "bullmq";
import { getBullmqConnectionOptions } from "./ingest/bullmqRedis.js";
import { QUEUE_NAMES } from "./ingest/queues.js";
import { processFilterJob } from "./ingest/handlers/filterJob.js";
import { processEnrichJob } from "./ingest/handlers/enrichJob.js";
import { processInsertJob } from "./ingest/handlers/insertJob.js";
import { logger } from "./lib/logger.js";

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
  const log = logger.child({ worker: label });
  worker.on("completed", (job, result) => {
    log.info({ jobId: job.id, result }, "job completed");
  });
  worker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, err: err?.message || err }, "job failed");
  });
}

attachLogging(filterWorker, "ingest-filter");
attachLogging(enrichWorker, "ingest-enrich");
attachLogging(insertWorker, "ingest-insert");

logger.info(
  { queues: Object.values(QUEUE_NAMES) },
  "Ingest worker listening"
);

async function shutdown() {
  logger.info("Shutting down ingest worker...");
  await Promise.all([
    filterWorker.close(),
    enrichWorker.close(),
    insertWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
