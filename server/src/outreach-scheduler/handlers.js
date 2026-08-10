import { sendOutreachBatch } from "../outreach/sendOutreachBatch.js";
import {
  claimOutreachSendJob,
  completeEmptyOutreachRun,
  completeOutreachDeliveries,
  completeOutreachSendJob,
  createOutreachRun,
  createOutreachSendJobs,
  failOutreachSendJob,
  getOutreachSchedule,
  getOutreachHistoryForJob,
  listOutreachDeliveries,
  markOutreachRunRunning,
  refreshOutreachRun,
  reserveOutreachBusinesses,
  updateOutreachDeliveries,
} from "./db.js";
import { enqueueOutreachSendJobs } from "./queues.js";
import { buildOutreachIdempotencyKey } from "./constants.js";

function campaignSnapshot(schedule) {
  return (schedule.outreach_schedule_campaigns ?? [])
    .filter((campaign) => campaign.enabled)
    .map((campaign) => ({
      outreach_type: campaign.outreach_type,
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

export async function processOutreachDispatchJob(job) {
  const schedule = await getOutreachSchedule();
  if (!schedule.enabled) {
    return { skipped: true, reason: "scheduler_disabled" };
  }

  const scheduledFor = scheduledTimeForJob(job);
  const campaigns = campaignSnapshot(schedule);
  const configSnapshot = {
    local_time: schedule.local_time,
    timezone: schedule.timezone,
    weekdays: schedule.weekdays,
    campaigns,
  };
  const { run, created } = await createOutreachRun({
    scheduledFor,
    configSnapshot,
    bullmqJobId: job.id,
  });
  const runCampaigns = created
    ? campaigns
    : run.config_snapshot?.campaigns ?? campaigns;
  const sendJobs = await createOutreachSendJobs(run.id, runCampaigns);
  if (sendJobs.length === 0) {
    await completeEmptyOutreachRun(run.id);
    return { runId: run.id, jobs: 0 };
  }
  await markOutreachRunRunning(run.id);
  await enqueueOutreachSendJobs(sendJobs);
  return { runId: run.id, jobs: sendJobs.length, resumed: !created };
}

export async function processOutreachSendJob(job) {
  const { runId, sendJobId, outreachType, limitCount } = job.data ?? {};
  if (!runId || !sendJobId || !outreachType || !limitCount) {
    throw new Error("Outreach send job is missing required data");
  }

  const claimed = await claimOutreachSendJob(
    sendJobId,
    (job.attemptsMade ?? 0) + 1
  );
  if (!claimed) {
    return { runId, sendJobId, skipped: true, reason: "job_not_claimable" };
  }

  const idempotencyKey = buildOutreachIdempotencyKey(sendJobId);
  try {
    await reserveOutreachBusinesses({
      sendJobId,
      outreachType,
      limitCount,
    });
    const deliveries = await listOutreachDeliveries(sendJobId);
    const existingHistory = await getOutreachHistoryForJob(sendJobId);
    await completeOutreachDeliveries(sendJobId, existingHistory);
    const alreadySentIds = new Set(
      existingHistory.map((row) => row.business_id)
    );
    const sendable = deliveries.filter((delivery) =>
      ["reserved", "sending"].includes(delivery.status) &&
      !alreadySentIds.has(delivery.business_id)
    );
    const businessIds = sendable.map((delivery) => delivery.business_id);
    await updateOutreachDeliveries(sendJobId, businessIds, {
      status: "sending",
      idempotency_key: idempotencyKey,
      started_at: new Date().toISOString(),
    });

    const result = await sendOutreachBatch({
      businessIds,
      outreachType,
      idempotencyKey,
      outreachJobId: sendJobId,
    });
    await completeOutreachDeliveries(sendJobId, result.history);
    const skippedIds = result.skipped.map((item) => item.id);
    await updateOutreachDeliveries(sendJobId, skippedIds, {
      status: "skipped",
      completed_at: new Date().toISOString(),
      error_data: { reason: "eligibility_changed" },
    });

    const allHistory = [...existingHistory, ...result.history];
    const completed = await completeOutreachSendJob(sendJobId, {
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
    await refreshOutreachRun(runId);
    return {
      runId,
      sendJobId,
      status: completed.status,
      sent: allHistory.length,
      skipped: result.skipped.length,
    };
  } catch (error) {
    const failedData = {
      code: error.code || "outreach_send_failed",
      message: error.message || "Scheduled outreach send failed",
      attempt: (job.attemptsMade ?? 0) + 1,
    };
    const attempts = job.opts?.attempts ?? 1;
    const finalAttempt = (job.attemptsMade ?? 0) + 1 >= attempts;
    let active = [];
    if (finalAttempt) {
      active = (await listOutreachDeliveries(sendJobId)).filter(
        (delivery) => ["reserved", "sending"].includes(delivery.status)
      );
    }
    await failOutreachSendJob(sendJobId, failedData, {
      failedCount: finalAttempt ? active.length : null,
    });
    if (finalAttempt) {
      await updateOutreachDeliveries(
        sendJobId,
        active.map((delivery) => delivery.business_id),
        {
          status: "failed",
          failed_at: new Date().toISOString(),
          error_data: failedData,
        }
      );
      await refreshOutreachRun(runId);
    }
    throw error;
  }
}
