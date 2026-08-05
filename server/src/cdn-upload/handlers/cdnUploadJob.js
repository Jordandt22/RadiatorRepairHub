import {
  claimCdnUploadBatch,
  failCdnUploadBatch,
  completeCdnUploadBatch,
  getCdnUploadBatch,
  markCdnUploadJobRunning,
  refreshCdnUploadJobProgress,
} from "../db.js";
import { processCdnUploadBusinesses } from "../upload.js";

export async function processCdnUploadJob({ batchId, jobId }) {
  if (!batchId) {
    throw new Error("cdn upload job missing batchId");
  }

  const existing = await getCdnUploadBatch(batchId);
  if (!existing) {
    throw new Error(`cdn upload batch not found: ${batchId}`);
  }

  if (existing.status !== "pending") {
    return {
      batchId,
      jobId: existing.job_id,
      status: existing.status,
      skipped: true,
    };
  }

  const claimed = await claimCdnUploadBatch(batchId);
  if (!claimed) {
    return { batchId, skipped: true };
  }

  const parentJobId = jobId || claimed.job_id;

  try {
    await markCdnUploadJobRunning(parentJobId);

    const businessIds = Array.isArray(claimed.business_ids)
      ? claimed.business_ids
      : [];
    const summary = await processCdnUploadBusinesses(businessIds);

    await completeCdnUploadBatch(batchId, {
      succeeded_count: summary.succeeded_count,
      failed_count: summary.failed_count,
      skipped_count: summary.skipped_count,
      result_payload: summary.result_payload,
    });

    const job = await refreshCdnUploadJobProgress(parentJobId);

    return {
      batchId,
      jobId: parentJobId,
      jobStatus: job.status,
      ...summary,
    };
  } catch (err) {
    await failCdnUploadBatch(batchId, {
      code: "cdn_upload_batch_failed",
      message: err?.message || "CDN upload batch failed",
    });
    await refreshCdnUploadJobProgress(parentJobId);
    throw err;
  }
}
