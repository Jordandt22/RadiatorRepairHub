import { supabase } from "../supabase/supabase.js";
import {
  buildOutreachSendQueueJobId,
  OUTREACH_DEFAULT_TIME,
  OUTREACH_SCHEDULER_ID,
  OUTREACH_TIMEZONE,
  SCHEDULED_OUTREACH_TYPES,
} from "./constants.js";

export async function getOutreachSchedule() {
  const { data, error } = await supabase
    .from("outreach_schedules")
    .select("*, outreach_schedule_campaigns(*)")
    .eq("scheduler_key", OUTREACH_SCHEDULER_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return {
      scheduler_key: OUTREACH_SCHEDULER_ID,
      enabled: false,
      local_time: OUTREACH_DEFAULT_TIME,
      timezone: OUTREACH_TIMEZONE,
      weekdays: [1, 2, 3, 4, 5],
      outreach_schedule_campaigns: SCHEDULED_OUTREACH_TYPES.map(
        (outreach_type) => ({
          outreach_type,
          enabled: true,
          limit_count: 25,
        })
      ),
    };
  }
  return data;
}

export async function updateOutreachSchedule({
  enabled,
  localTime,
  timezone,
  campaigns,
}) {
  const now = new Date().toISOString();
  const { data: schedule, error: scheduleError } = await supabase
    .from("outreach_schedules")
    .upsert(
      {
        scheduler_key: OUTREACH_SCHEDULER_ID,
        enabled,
        local_time: localTime,
        timezone,
        weekdays: [1, 2, 3, 4, 5],
        updated_at: now,
      },
      { onConflict: "scheduler_key" }
    )
    .select("*")
    .single();
  if (scheduleError) throw scheduleError;

  const rows = campaigns.map((campaign) => ({
    schedule_id: schedule.id,
    outreach_type: campaign.outreach_type,
    enabled: campaign.enabled,
    limit_count: campaign.limit_count,
    updated_at: now,
  }));
  const { error: campaignError } = await supabase
    .from("outreach_schedule_campaigns")
    .upsert(rows, { onConflict: "schedule_id,outreach_type" });
  if (campaignError) throw campaignError;
  return getOutreachSchedule();
}

export async function createOutreachRun({
  scheduledFor,
  trigger = "scheduled",
  configSnapshot,
  bullmqJobId = null,
}) {
  const { data, error } = await supabase
    .from("outreach_schedule_runs")
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
    .from("outreach_schedule_runs")
    .select("*")
    .eq("trigger", trigger)
    .eq("scheduled_for", scheduledFor)
    .single();
  if (existingError) throw existingError;
  return { run: existing, created: false };
}

export async function createOutreachSendJobs(runId, campaigns) {
  const rows = campaigns.map((campaign) => ({
    run_id: runId,
    outreach_type: campaign.outreach_type,
    limit_count: campaign.limit_count,
    status: "pending",
    bullmq_job_id: buildOutreachSendQueueJobId(
      runId,
      campaign.outreach_type
    ),
  }));
  const { data, error } = await supabase
    .from("outreach_send_jobs")
    .upsert(rows, { onConflict: "run_id,outreach_type", ignoreDuplicates: true })
    .select("*");
  if (error) throw error;

  if ((data ?? []).length === rows.length) return data;
  const { data: existing, error: existingError } = await supabase
    .from("outreach_send_jobs")
    .select("*")
    .eq("run_id", runId)
    .in(
      "outreach_type",
      campaigns.map((campaign) => campaign.outreach_type)
    );
  if (existingError) throw existingError;
  return existing ?? [];
}

export async function markOutreachRunRunning(runId) {
  const { error } = await supabase
    .from("outreach_schedule_runs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", runId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function completeEmptyOutreachRun(runId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("outreach_schedule_runs")
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

export async function claimOutreachSendJob(sendJobId, attemptCount = 1) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("outreach_send_jobs")
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

export async function reserveOutreachBusinesses({
  sendJobId,
  outreachType,
  limitCount,
}) {
  const { data, error } = await supabase.rpc(
    "reserve_outreach_send_deliveries",
    {
      p_send_job_id: sendJobId,
      p_outreach_type: outreachType,
      p_limit_count: limitCount,
    }
  );
  if (error) throw error;
  return data ?? [];
}

export async function listOutreachDeliveries(sendJobId) {
  const { data, error } = await supabase
    .from("outreach_send_deliveries")
    .select("*")
    .eq("send_job_id", sendJobId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOutreachHistoryForJob(sendJobId) {
  const { data, error } = await supabase
    .from("outreach_history")
    .select(
      "outreach_history_id, business_id, outreach_type, recipient, subject, provider_message_id, sent_at, metadata"
    )
    .contains("metadata", { outreach_job_id: sendJobId });
  if (error) throw error;
  return data ?? [];
}

export async function updateOutreachDeliveries(sendJobId, businessIds, patch) {
  if (!businessIds?.length) return [];
  const { data, error } = await supabase
    .from("outreach_send_deliveries")
    .update(patch)
    .eq("send_job_id", sendJobId)
    .in("business_id", businessIds)
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function completeOutreachDeliveries(sendJobId, historyRows) {
  if (!historyRows?.length) return [];
  const { data: existing, error: existingError } = await supabase
    .from("outreach_send_deliveries")
    .select("id, business_id, outreach_type, idempotency_key, created_at")
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
      outreach_type: delivery.outreach_type,
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
    .from("outreach_send_deliveries")
    .upsert(rows, { onConflict: "id" })
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function completeOutreachSendJob(sendJobId, result) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("outreach_send_jobs")
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

export async function failOutreachSendJob(
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
    .from("outreach_send_jobs")
    .update(patch)
    .eq("id", sendJobId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function refreshOutreachRun(runId) {
  const { data: jobs, error: jobsError } = await supabase
    .from("outreach_send_jobs")
    .select("*")
    .eq("run_id", runId);
  if (jobsError) throw jobsError;

  const terminal = jobs?.length > 0 &&
    jobs.every((job) => ["completed", "failed"].includes(job.status));
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
    .from("outreach_schedule_runs")
    .update(patch)
    .eq("id", runId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listRecentOutreachRuns(limit = 10) {
  const result = await listOutreachRuns(1, limit);
  return result.runs;
}

export async function listOutreachRuns(page = 1, limit = 10) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const from = (safePage - 1) * safeLimit;
  const { data, count, error } = await supabase
    .from("outreach_schedule_runs")
    .select("*, outreach_send_jobs(*)", { count: "exact" })
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

export async function getOutreachSendJobDetail(sendJobId) {
  const { data: job, error: jobError } = await supabase
    .from("outreach_send_jobs")
    .select("*, outreach_schedule_runs(*)")
    .eq("id", sendJobId)
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job) return null;

  const { data: deliveries, error: deliveryError } = await supabase
    .from("outreach_send_deliveries")
    .select(
      "*, businesses(id, title, slug, email, phone, website, address)"
    )
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
