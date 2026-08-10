import "dotenv/config";
import { Worker } from "bullmq";
import { getBullmqConnectionOptions } from "./ingest/bullmqRedis.js";
import { QUEUE_NAMES } from "./ingest/queues.js";
import { CDN_UPLOAD_QUEUE_NAME } from "./cdn-upload/queues.js";
import { EMAIL_SCRAPE_QUEUE_NAME } from "./email-scrape/queues.js";
import { processFilterJob } from "./ingest/handlers/filterJob.js";
import { processEnrichJob } from "./ingest/handlers/enrichJob.js";
import { processInsertJob } from "./ingest/handlers/insertJob.js";
import { processCdnUploadJob } from "./cdn-upload/handlers/cdnUploadJob.js";
import { processEmailScrapeJob } from "./email-scrape/handlers/emailScrapeJob.js";
import {
  OUTREACH_DISPATCH_QUEUE_NAME,
  OUTREACH_SEND_QUEUE_NAME,
} from "./outreach-scheduler/constants.js";
import {
  processOutreachDispatchJob,
  processOutreachSendJob,
} from "./outreach-scheduler/handlers.js";
import { closeOutreachQueues } from "./outreach-scheduler/queues.js";
import { reconcileOutreachScheduler } from "./outreach-scheduler/scheduler.js";
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

const cdnUploadWorker = new Worker(
  CDN_UPLOAD_QUEUE_NAME,
  async (job) => processCdnUploadJob(job.data),
  { connection, concurrency: 2 }
);

const emailScrapeWorker = new Worker(
  EMAIL_SCRAPE_QUEUE_NAME,
  async (job) => processEmailScrapeJob(job.data),
  { connection, concurrency: 2 }
);

const outreachDispatchWorker = new Worker(
  OUTREACH_DISPATCH_QUEUE_NAME,
  processOutreachDispatchJob,
  { connection, concurrency: 1 }
);

const outreachSendWorker = new Worker(
  OUTREACH_SEND_QUEUE_NAME,
  processOutreachSendJob,
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
attachLogging(cdnUploadWorker, "cdn-upload");
attachLogging(emailScrapeWorker, "email-scrape");
attachLogging(outreachDispatchWorker, "outreach-dispatch");
attachLogging(outreachSendWorker, "outreach-send");

logger.info(
  {
    queues: [
      ...Object.values(QUEUE_NAMES),
      CDN_UPLOAD_QUEUE_NAME,
      EMAIL_SCRAPE_QUEUE_NAME,
      OUTREACH_DISPATCH_QUEUE_NAME,
      OUTREACH_SEND_QUEUE_NAME,
    ],
  },
  "Worker listening"
);

reconcileOutreachScheduler()
  .then((scheduler) => {
    logger.info({ scheduler }, "Outreach scheduler reconciled");
  })
  .catch((err) => {
    logger.error(
      { err: err?.message || err },
      "Outreach scheduler reconciliation failed"
    );
  });

async function shutdown() {
  logger.info("Shutting down worker...");
  await Promise.all([
    filterWorker.close(),
    enrichWorker.close(),
    insertWorker.close(),
    cdnUploadWorker.close(),
    emailScrapeWorker.close(),
    outreachDispatchWorker.close(),
    outreachSendWorker.close(),
    closeOutreachQueues(),
  ]);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
