import { supabase } from "../supabase/supabase.js";
import { expandCampaignsIntoSendChunks, getEmailSendChunkOptions } from "../lib/emailSendChunks.js";
import {
  buildDigestSendQueueJobId,
  DIGEST_DEFAULT_TIME,
  DIGEST_DEFAULT_WEEKDAY,
  DIGEST_SCHEDULER_ID,
  DIGEST_TIMEZONE,
  SCHEDULED_DIGEST_SEGMENTS,
} from "./constants.js";

export async function getDigestSchedule() {
  const { data, error } = await supabase
    .from("digest_schedules")
    .select("*, digest_schedule_campaigns(*)")
    .eq("scheduler_key", DIGEST_SCHEDULER_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return {
      scheduler_key: DIGEST_SCHEDULER_ID,
      enabled: false,
      local_time: DIGEST_DEFAULT_TIME,
      timezone: DIGEST_TIMEZONE,
      weekday: DIGEST_DEFAULT_WEEKDAY,
      digest_schedule_campaigns: SCHEDULED_DIGEST_SEGMENTS.map(
        (digest_segment) => ({
          digest_segment,
          enabled: true,
          limit_count: 5000,
        })
      ),
    };
  }
  return data;
}

export async function updateDigestSchedule({
  enabled,
  localTime,
  timezone,
  weekday,
  campaigns,
}) {
  const now = new Date().toISOString();
  const { data: schedule, error: scheduleError } = await supabase
    .from("digest_schedules")
    .upsert(
      {
        scheduler_key: DIGEST_SCHEDULER_ID,
        enabled,
        local_time: localTime,
        timezone,
        weekday: weekday ?? DIGEST_DEFAULT_WEEKDAY,
        updated_at: now,
      },
      { onConflict: "scheduler_key" }
    )
    .select("*")
    .single();
  if (scheduleError) throw scheduleError;

  const rows = campaigns.map((campaign) => ({
    schedule_id: schedule.id,
    digest_segment: campaign.digest_segment,
    enabled: campaign.enabled,
    limit_count: campaign.limit_count,
    updated_at: now,
  }));
  const { error: campaignError } = await supabase
    .from("digest_schedule_campaigns")
    .upsert(rows, { onConflict: "schedule_id,digest_segment" });
  if (campaignError) throw campaignError;
  return getDigestSchedule();
}

export async function createDigestRun({
  scheduledFor,
  trigger = "scheduled",
  configSnapshot,
  bullmqJobId = null,
}) {
  const { data, error } = await supabase
    .from("digest_schedule_runs")
    .upsert(
      {
        scheduled_for: scheduledFor,
        trigger,
        config_snapshot: configSnapshot,
        bullmq_job_id: bullmqJobId,
        status: "pending",
      },
      { onConflict: "trigger,scheduled_for", ignoreDuplicates: true }
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (data) return { run: data, created: true };

  const { data: existing, error: existingError } = await supabase
    .from("digest_schedule_runs")
    .select("*")
    .eq("trigger", trigger)
    .eq("scheduled_for", scheduledFor)
    .single();
  if (existingError) throw existingError;
  return { run: existing, created: false };
}

export async function createDigestSendJobs(runId, campaigns) {
  const chunks = expandCampaignsIntoSendChunks(
    campaigns,
    getEmailSendChunkOptions()
  );
  const rows = chunks.map((campaign) => ({
    run_id: runId,
    digest_segment: campaign.digest_segment,
    chunk_index: campaign.chunk_index,
    limit_count: campaign.limit_count,
    status: "pending",
    bullmq_job_id: buildDigestSendQueueJobId(
      runId,
      campaign.digest_segment,
      campaign.chunk_index
    ),
  }));
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("digest_send_jobs")
    .upsert(rows, {
      onConflict: "run_id,digest_segment,chunk_index",
      ignoreDuplicates: true,
    })
    .select("*");
  if (error) throw error;

  if ((data ?? []).length === rows.length) return data;
  const { data: existing, error: existingError } = await supabase
    .from("digest_send_jobs")
    .select("*")
    .eq("run_id", runId)
    .in(
      "digest_segment",
      campaigns.map((campaign) => campaign.digest_segment)
    )
    .order("digest_segment", { ascending: true })
    .order("chunk_index", { ascending: true });
  if (existingError) throw existingError;
  return existing ?? [];
}

export async function markDigestRunRunning(runId) {
  const { error } = await supabase
    .from("digest_schedule_runs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", runId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function completeEmptyDigestRun(runId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("digest_schedule_runs")
    .update({
      status: "completed",
      started_at: now,
      completed_at: now,
    })
    .eq("id", runId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function claimDigestSendJob(sendJobId, attemptCount = 1) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("digest_send_jobs")
    .update({
      status: "running",
      started_at: now,
      failed_at: null,
      failed_data: null,
      attempt_count: attemptCount,
    })
    .eq("id", sendJobId)
    .in("status", ["pending", "failed"])
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function reserveDigestBusinesses({
  sendJobId,
  digestSegment,
  limitCount,
}) {
  const { data, error } = await supabase.rpc("reserve_digest_deliveries", {
    p_send_job_id: sendJobId,
    p_digest_segment: digestSegment,
    p_limit_count: limitCount,
  });
  if (error) throw error;
  return data ?? [];
}

export async function listDigestDeliveries(sendJobId) {
  const { data, error } = await supabase
    .from("digest_send_deliveries")
    .select("*")
    .eq("send_job_id", sendJobId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDigestHistoryForJob(sendJobId) {
  const { data, error } = await supabase
    .from("digest_history")
    .select(
      "id, business_id, digest_segment, recipient, subject, provider_message_id, sent_at, metadata"
    )
    .eq("send_job_id", sendJobId);
  if (error) throw error;
  return data ?? [];
}

export async function updateDigestDeliveries(sendJobId, businessIds, patch) {
  if (!businessIds?.length) return [];
  const { data, error } = await supabase
    .from("digest_send_deliveries")
    .update(patch)
    .eq("send_job_id", sendJobId)
    .in("business_id", businessIds)
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function completeDigestDeliveries(sendJobId, historyRows) {
  if (!historyRows?.length) return [];
  const { data: existing, error: existingError } = await supabase
    .from("digest_send_deliveries")
    .select("id, business_id, digest_segment, idempotency_key, created_at")
    .eq("send_job_id", sendJobId)
    .in(
      "business_id",
      historyRows.map((row) => row.business_id)
    );
  if (existingError) throw existingError;
  const historyByBusinessId = new Map(
    historyRows.map((row) => [row.business_id, row])
  );
  const now = new Date().toISOString();
  const rows = (existing ?? []).map((delivery) => {
    const history = historyByBusinessId.get(delivery.business_id);
    return {
      id: delivery.id,
      send_job_id: sendJobId,
      business_id: delivery.business_id,
      digest_segment: delivery.digest_segment,
      status: "sent",
      recipient: history?.recipient ?? null,
      provider_message_id: history?.provider_message_id ?? null,
      sent_at: history?.sent_at ?? now,
      completed_at: now,
      error_data: null,
      idempotency_key: delivery.idempotency_key,
      created_at: delivery.created_at,
    };
  });
  const { data, error } = await supabase
    .from("digest_send_deliveries")
    .upsert(rows, { onConflict: "id" })
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function completeDigestSendJob(sendJobId, result) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("digest_send_jobs")
    .update({
      status: "completed",
      selected_count: result.selectedCount,
      sent_count: result.sentCount,
      skipped_count: result.skippedCount,
      failed_count: result.failedCount,
      result_payload: result.resultPayload,
      completed_at: now,
      failed_at: null,
      failed_data: null,
    })
    .eq("id", sendJobId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function failDigestSendJob(
  sendJobId,
  failedData,
  { failedCount = null } = {}
) {
  const patch = {
    status: "failed",
    failed_at: new Date().toISOString(),
    failed_data: failedData,
  };
  if (failedCount != null) patch.failed_count = failedCount;
  const { data, error } = await supabase
    .from("digest_send_jobs")
    .update(patch)
    .eq("id", sendJobId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function refreshDigestRun(runId) {
  const { data: jobs, error: jobsError } = await supabase
    .from("digest_send_jobs")
    .select("*")
    .eq("run_id", runId);
  if (jobsError) throw jobsError;

  const terminal =
    jobs?.length > 0 &&
    jobs.every((job) =>
      ["completed", "failed", "cleared"].includes(job.status)
    );
  const failed = jobs.some((job) => job.status === "failed");
  const patch = {
    status: terminal ? (failed ? "failed" : "completed") : "running",
    selected_count: jobs.reduce(
      (sum, job) => sum + (job.selected_count ?? 0),
      0
    ),
    sent_count: jobs.reduce((sum, job) => sum + (job.sent_count ?? 0), 0),
    skipped_count: jobs.reduce(
      (sum, job) => sum + (job.skipped_count ?? 0),
      0
    ),
    failed_count: jobs.reduce(
      (sum, job) => sum + (job.failed_count ?? 0),
      0
    ),
  };
  if (terminal) {
    patch.completed_at = new Date().toISOString();
    patch.failed_at = failed ? patch.completed_at : null;
  }
  const { data, error } = await supabase
    .from("digest_schedule_runs")
    .update(patch)
    .eq("id", runId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listRecentDigestRuns(limit = 10) {
  const result = await listDigestRuns(1, limit);
  return result.runs;
}

export async function listDigestRuns(page = 1, limit = 10) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const from = (safePage - 1) * safeLimit;
  const { data, count, error } = await supabase
    .from("digest_schedule_runs")
    .select("*, digest_send_jobs(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + safeLimit - 1);
  if (error) throw error;
  return {
    runs: data ?? [],
    count: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getDigestSendJobDetail(sendJobId) {
  const { data: job, error: jobError } = await supabase
    .from("digest_send_jobs")
    .select("*, digest_schedule_runs(*)")
    .eq("id", sendJobId)
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job) return null;

  const { data: deliveries, error: deliveryError } = await supabase
    .from("digest_send_deliveries")
    .select("*, businesses(id, title, slug, email)")
    .eq("send_job_id", sendJobId)
    .order("created_at", { ascending: true });
  if (deliveryError) throw deliveryError;

  const skippedByBusinessId = new Map(
    (job.result_payload?.skipped ?? [])
      .filter((item) => item?.id)
      .map((item) => [String(item.id), item.reason ?? null])
  );

  return {
    job,
    deliveries: (deliveries ?? []).map((delivery) => ({
      ...delivery,
      reason:
        skippedByBusinessId.get(String(delivery.business_id)) ??
        delivery.error_data?.reason ??
        delivery.error_data?.message ??
        null,
    })),
  };
}

export async function clearDigestSendJobHistory(sendJobId) {
  const { data: job, error: jobError } = await supabase
    .from("digest_send_jobs")
    .select("id, run_id, digest_segment, limit_count")
    .eq("id", sendJobId)
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job) return null;

  const { data: deletedHistory, error: historyDeleteError } = await supabase
    .from("digest_history")
    .delete()
    .eq("send_job_id", sendJobId)
    .select("id");
  if (historyDeleteError) throw historyDeleteError;

  const { data: deletedDeliveries, error: deliveryDeleteError } = await supabase
    .from("digest_send_deliveries")
    .delete()
    .eq("send_job_id", sendJobId)
    .select("id");
  if (deliveryDeleteError) throw deliveryDeleteError;

  const now = new Date().toISOString();
  const { data: resetJob, error: resetError } = await supabase
    .from("digest_send_jobs")
    .update({
      status: "cleared",
      selected_count: 0,
      sent_count: 0,
      skipped_count: 0,
      failed_count: 0,
      result_payload: {
        cleared_at: now,
        cleared: true,
        sent: [],
        skipped: [],
        resend_ids: [],
      },
      failed_data: null,
      failed_at: null,
      completed_at: now,
    })
    .eq("id", sendJobId)
    .select("*")
    .single();
  if (resetError) throw resetError;

  if (job.run_id) {
    await refreshDigestRun(job.run_id);
  }

  return {
    job: resetJob,
    deleted_history: deletedHistory?.length ?? 0,
    deleted_deliveries: deletedDeliveries?.length ?? 0,
  };
}
