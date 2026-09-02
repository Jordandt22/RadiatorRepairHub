import "dotenv/config";
import { Worker } from "bullmq";
import { getBullmqConnectionOptions } from "./ingest/bullmqRedis.js";
import { QUEUE_NAMES } from "./ingest/queues.js";
import {
  INGEST_ENRICH_JOB_LOCK_DURATION_MS,
  INGEST_ENRICH_STALLED_INTERVAL_MS,
  INGEST_INSERT_JOB_LOCK_DURATION_MS,
  INGEST_INSERT_STALLED_INTERVAL_MS,
} from "./ingest/constants.js";
import { CDN_UPLOAD_QUEUE_NAME } from "./cdn-upload/queues.js";
import {
  closeEmailScrapeQueue,
  EMAIL_SCRAPE_QUEUE_NAME,
} from "./email-scrape/queues.js";
import {
  EMAIL_SCRAPE_JOB_LOCK_DURATION_MS,
  EMAIL_SCRAPE_STALLED_INTERVAL_MS,
} from "./email-scrape/constants.js";
import { reconcileOrphanedEmailScrapeBatches } from "./email-scrape/retry.js";
import {
  APIFY_SCRAPE_QUEUE_NAME,
  APIFY_JOB_LOCK_DURATION_MS,
} from "./apify-scrape/constants.js";
import { closeApifyScrapeQueue } from "./apify-scrape/queues.js";
import { processApifyScrapeCityJob } from "./apify-scrape/handlers/cityJob.js";
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
import {
  DIGEST_DISPATCH_QUEUE_NAME,
  DIGEST_SEND_QUEUE_NAME,
} from "./digest-scheduler/constants.js";
import {
  processDigestDispatchJob,
  processDigestSendJob,
} from "./digest-scheduler/handlers.js";
import { closeDigestQueues } from "./digest-scheduler/queues.js";
import { reconcileDigestScheduler } from "./digest-scheduler/scheduler.js";
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
  {
    connection,
    concurrency: 2,
    lockDuration: INGEST_ENRICH_JOB_LOCK_DURATION_MS,
    stalledInterval: INGEST_ENRICH_STALLED_INTERVAL_MS,
  }
);

const insertWorker = new Worker(
  QUEUE_NAMES.insert,
  async (job) => processInsertJob(job.data),
  {
    connection,
    concurrency: 1,
    lockDuration: INGEST_INSERT_JOB_LOCK_DURATION_MS,
    stalledInterval: INGEST_INSERT_STALLED_INTERVAL_MS,
  }
);

const cdnUploadWorker = new Worker(
  CDN_UPLOAD_QUEUE_NAME,
  async (job) => processCdnUploadJob(job.data),
  { connection, concurrency: 2 }
);

const emailScrapeWorker = new Worker(
  EMAIL_SCRAPE_QUEUE_NAME,
  async (job) => processEmailScrapeJob(job.data),
  {
    connection,
    concurrency: 2,
    lockDuration: EMAIL_SCRAPE_JOB_LOCK_DURATION_MS,
    stalledInterval: EMAIL_SCRAPE_STALLED_INTERVAL_MS,
  }
);

const apifyScrapeWorker = new Worker(
  APIFY_SCRAPE_QUEUE_NAME,
  processApifyScrapeCityJob,
  {
    connection,
    concurrency: 1,
    lockDuration: APIFY_JOB_LOCK_DURATION_MS,
    stalledInterval: 600_000,
  }
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

const digestDispatchWorker = new Worker(
  DIGEST_DISPATCH_QUEUE_NAME,
  processDigestDispatchJob,
  { connection, concurrency: 1 }
);

const digestSendWorker = new Worker(
  DIGEST_SEND_QUEUE_NAME,
  processDigestSendJob,
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
attachLogging(apifyScrapeWorker, "apify-scrape-city");
attachLogging(outreachDispatchWorker, "outreach-dispatch");
attachLogging(outreachSendWorker, "outreach-send");
attachLogging(digestDispatchWorker, "digest-dispatch");
attachLogging(digestSendWorker, "digest-send");

logger.info(
  {
    queues: [
      ...Object.values(QUEUE_NAMES),
      CDN_UPLOAD_QUEUE_NAME,
      EMAIL_SCRAPE_QUEUE_NAME,
      APIFY_SCRAPE_QUEUE_NAME,
      OUTREACH_DISPATCH_QUEUE_NAME,
      OUTREACH_SEND_QUEUE_NAME,
      DIGEST_DISPATCH_QUEUE_NAME,
      DIGEST_SEND_QUEUE_NAME,
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

reconcileDigestScheduler()
  .then((scheduler) => {
    logger.info({ scheduler }, "Digest scheduler reconciled");
  })
  .catch((err) => {
    logger.error(
      { err: err?.message || err },
      "Digest scheduler reconciliation failed"
    );
  });

reconcileOrphanedEmailScrapeBatches()
  .then((retried) => {
    if (retried.length > 0) {
      logger.info(
        { count: retried.length, batches: retried },
        "Orphaned email scrape batches re-enqueued"
      );
    }
  })
  .catch((err) => {
    logger.error(
      { err: err?.message || err },
      "Email scrape orphan reconciliation failed"
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
    apifyScrapeWorker.close(),
    outreachDispatchWorker.close(),
    outreachSendWorker.close(),
    digestDispatchWorker.close(),
    digestSendWorker.close(),
    closeOutreachQueues(),
    closeDigestQueues(),
    closeApifyScrapeQueue(),
    closeEmailScrapeQueue(),
  ]);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
