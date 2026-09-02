import { sendDigestBatch } from "../digest/sendDigestBatch.js";
import {
  claimDigestSendJob,
  completeEmptyDigestRun,
  completeDigestDeliveries,
  completeDigestSendJob,
  createDigestRun,
  createDigestSendJobs,
  failDigestSendJob,
  getDigestSchedule,
  getDigestHistoryForJob,
  listDigestDeliveries,
  markDigestRunRunning,
  refreshDigestRun,
  reserveDigestBusinesses,
  updateDigestDeliveries,
} from "./db.js";
import { enqueueDigestSendJobs } from "./queues.js";
import { buildDigestIdempotencyKey } from "./constants.js";

function campaignSnapshot(schedule) {
  return (schedule.digest_schedule_campaigns ?? [])
    .filter((campaign) => campaign.enabled)
    .map((campaign) => ({
      digest_segment: campaign.digest_segment,
      limit_count: campaign.limit_count,
    }));
}

function scheduledTimeForJob(job) {
  const idMillis = Number(String(job.id ?? "").split(":").at(-1));
  if (Number.isFinite(idMillis) && idMillis > 0) {
    return new Date(idMillis).toISOString();
  }
  return job.data?.scheduledFor || new Date(job.timestamp ?? Date.now()).toISOString();
}

export async function processDigestDispatchJob(job) {
  const schedule = await getDigestSchedule();
  if (!schedule.enabled) {
    return { skipped: true, reason: "scheduler_disabled" };
  }

  const scheduledFor = scheduledTimeForJob(job);
  const campaigns = campaignSnapshot(schedule);
  const configSnapshot = {
    local_time: schedule.local_time,
    timezone: schedule.timezone,
    weekday: schedule.weekday,
    campaigns,
  };
  const { run, created } = await createDigestRun({
    scheduledFor,
    configSnapshot,
    bullmqJobId: job.id,
  });
  const runCampaigns = created
    ? campaigns
    : run.config_snapshot?.campaigns ?? campaigns;
  const sendJobs = await createDigestSendJobs(run.id, runCampaigns);
  if (sendJobs.length === 0) {
    await completeEmptyDigestRun(run.id);
    return { runId: run.id, jobs: 0 };
  }
  await markDigestRunRunning(run.id);
  await enqueueDigestSendJobs(sendJobs);
  return { runId: run.id, jobs: sendJobs.length, resumed: !created };
}

export async function processDigestSendJob(job) {
  const { runId, sendJobId, digestSegment, limitCount } = job.data ?? {};
  if (!runId || !sendJobId || !digestSegment || !limitCount) {
    throw new Error("Digest send job is missing required data");
  }

  const claimed = await claimDigestSendJob(
    sendJobId,
    (job.attemptsMade ?? 0) + 1
  );
  if (!claimed) {
    return { runId, sendJobId, skipped: true, reason: "job_not_claimable" };
  }

  const idempotencyKey = buildDigestIdempotencyKey(sendJobId);
  try {
    await reserveDigestBusinesses({
      sendJobId,
      digestSegment,
      limitCount,
    });
    const deliveries = await listDigestDeliveries(sendJobId);
    const existingHistory = await getDigestHistoryForJob(sendJobId);
    await completeDigestDeliveries(sendJobId, existingHistory);
    const alreadySentIds = new Set(
      existingHistory.map((row) => row.business_id)
    );
    const sendable = deliveries.filter(
      (delivery) =>
        ["reserved", "sending"].includes(delivery.status) &&
        !alreadySentIds.has(delivery.business_id)
    );
    const businessIds = sendable.map((delivery) => delivery.business_id);
    await updateDigestDeliveries(sendJobId, businessIds, {
      status: "sending",
      idempotency_key: idempotencyKey,
      started_at: new Date().toISOString(),
    });

    const result = await sendDigestBatch({
      businessIds,
      digestSegment,
      idempotencyKey,
      digestJobId: sendJobId,
    });
    await completeDigestDeliveries(sendJobId, result.history);
    const skippedIds = result.skipped.map((item) => item.id);
    await updateDigestDeliveries(sendJobId, skippedIds, {
      status: "skipped",
      completed_at: new Date().toISOString(),
      error_data: { reason: "eligibility_changed" },
    });

    const allHistory = [...existingHistory, ...result.history];
    const completed = await completeDigestSendJob(sendJobId, {
      selectedCount: deliveries.length,
      sentCount: allHistory.length,
      skippedCount: result.skipped.length,
      failedCount: 0,
      resultPayload: {
        sent: allHistory.map((row) => row.business_id),
        skipped: result.skipped,
        resend_ids: result.resendIds,
      },
    });
    await refreshDigestRun(runId);
    return {
      runId,
      sendJobId,
      status: completed.status,
      sent: allHistory.length,
      skipped: result.skipped.length,
    };
  } catch (error) {
    const failedData = {
      code: error.code || "digest_send_failed",
      message: error.message || "Scheduled digest send failed",
      attempt: (job.attemptsMade ?? 0) + 1,
    };
    const attempts = job.opts?.attempts ?? 1;
    const finalAttempt = (job.attemptsMade ?? 0) + 1 >= attempts;
    let active = [];
    if (finalAttempt) {
      active = (await listDigestDeliveries(sendJobId)).filter((delivery) =>
        ["reserved", "sending"].includes(delivery.status)
      );
    }
    await failDigestSendJob(sendJobId, failedData, {
      failedCount: finalAttempt ? active.length : null,
    });
    if (finalAttempt) {
      await updateDigestDeliveries(
        sendJobId,
        active.map((delivery) => delivery.business_id),
        {
          status: "failed",
          failed_at: new Date().toISOString(),
          error_data: failedData,
        }
      );
      await refreshDigestRun(runId);
    }
    throw error;
  }
}
