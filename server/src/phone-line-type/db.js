import { supabase } from "../supabase/supabase.js";

const JOB_COLUMNS =
  "id, status, limit_count, selected_count, succeeded_count, failed_count, skipped_count, error_message, created_at, started_at, completed_at, failed_at";

export async function createPhoneLineTypeJob({
  limitCount,
  selectedCount = 0,
  businessIds = [],
} = {}) {
  const now = new Date().toISOString();
  const finished = selectedCount === 0;
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .insert({
      status: finished ? "completed" : "pending",
      limit_count: limitCount,
      selected_count: selectedCount,
      business_ids: businessIds,
      started_at: finished ? now : null,
      completed_at: finished ? now : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getPhoneLineTypeJob(jobId) {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listPhoneLineTypeJobs() {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .select(JOB_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function hasActivePhoneLineTypeJob() {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .select("id")
    .in("status", ["pending", "running"])
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markPhoneLineTypeJobRunning(jobId) {
  const existing = await getPhoneLineTypeJob(jobId);
  if (!existing) return null;
  if (existing.status === "completed") return existing;

  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .update({
      status: "running",
      started_at: existing.started_at ?? new Date().toISOString(),
      completed_at: null,
      failed_at: null,
      error_message: null,
    })
    .eq("id", jobId)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updatePhoneLineTypeJobCounts(
  jobId,
  { succeeded = 0, failed = 0, skipped = 0 } = {}
) {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .update({
      succeeded_count: succeeded,
      failed_count: failed,
      skipped_count: skipped,
    })
    .eq("id", jobId)
    .select(JOB_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markPhoneLineTypeJobCompleted(jobId) {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      failed_at: null,
      error_message: null,
    })
    .eq("id", jobId)
    .select(JOB_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markPhoneLineTypeJobFailed(jobId, message) {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .update({
      status: "failed",
      failed_at: new Date().toISOString(),
      error_message: message ? String(message).slice(0, 500) : "Job failed.",
    })
    .eq("id", jobId)
    .select(JOB_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deletePhoneLineTypeJobs(jobIds) {
  const { data, error } = await supabase
    .from("phone_line_type_jobs")
    .delete()
    .in("id", jobIds)
    .in("status", ["completed", "failed"])
    .select("id");

  if (error) throw error;
  return data ?? [];
}
