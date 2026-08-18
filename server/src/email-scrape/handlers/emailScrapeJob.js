import {
  claimEmailScrapeBatch,
  failEmailScrapeBatch,
  completeEmailScrapeBatch,
  getEmailScrapeBatch,
  markEmailScrapeJobRunning,
  refreshEmailScrapeJobProgress,
  resetEmailScrapeBatchForRetry,
} from "../db.js";
import { processEmailScrapeBusinesses } from "../process.js";

export async function processEmailScrapeJob({ batchId, jobId }) {
  if (!batchId) {
    throw new Error("email scrape job missing batchId");
  }

  const existing = await getEmailScrapeBatch(batchId);
  if (!existing) {
    throw new Error(`email scrape batch not found: ${batchId}`);
  }

  if (existing.status === "completed" || existing.status === "failed") {
    return {
      batchId,
      jobId: existing.job_id,
      status: existing.status,
      skipped: true,
    };
  }

  if (existing.status === "running") {
    await resetEmailScrapeBatchForRetry(batchId);
  }

  const claimed = await claimEmailScrapeBatch(batchId);
  if (!claimed) {
    return { batchId, skipped: true };
  }

  const parentJobId = jobId || claimed.job_id;

  try {
    await markEmailScrapeJobRunning(parentJobId);

    const businessIds = Array.isArray(claimed.business_ids)
      ? claimed.business_ids
      : [];
    const summary = await processEmailScrapeBusinesses(businessIds);

    await completeEmailScrapeBatch(batchId, {
      succeeded_count: summary.succeeded_count,
      failed_count: summary.failed_count,
      skipped_count: summary.skipped_count,
      result_payload: summary.result_payload,
    });

    const job = await refreshEmailScrapeJobProgress(parentJobId);

    return {
      batchId,
      jobId: parentJobId,
      jobStatus: job.status,
      ...summary,
    };
  } catch (err) {
    await failEmailScrapeBatch(batchId, {
      code: "email_scrape_batch_failed",
      message: err?.message || "Email scrape batch failed",
    });
    await refreshEmailScrapeJobProgress(parentJobId);
    throw err;
  }
}
