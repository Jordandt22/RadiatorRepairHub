import { supabase } from "../supabase/supabase.js";
import {
  buildIlikeOrFilter,
  sanitizeIlikeSearch,
} from "../lib/sanitizeSearch.js";
import { MAX_CDN_STORED_ATTEMPTS } from "./constants.js";

function summarizeBatchStatuses(batches = []) {
  const total_batches = batches.length;
  const completed_batches = batches.filter((b) => b.status === "completed").length;
  const failed_batches = batches.filter((b) => b.status === "failed").length;
  const running_batches = batches.filter((b) => b.status === "running").length;
  const pending_batches = batches.filter((b) => b.status === "pending").length;
  return {
    total_batches,
    completed_batches,
    failed_batches,
    running_batches,
    pending_batches,
  };
}

function mergeBatchResults(batches = []) {
  return batches
    .slice()
    .sort((a, b) => (a.batch_index ?? 0) - (b.batch_index ?? 0))
    .flatMap((batch) =>
      Array.isArray(batch.result_payload) ? batch.result_payload : []
    );
}

export async function createCdnUploadJob({
  limitCount = 300,
  selectedCount = 0,
} = {}) {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .insert({
      status: selectedCount > 0 ? "pending" : "completed",
      limit_count: limitCount,
      selected_count: selectedCount,
      started_at: selectedCount > 0 ? null : new Date().toISOString(),
      completed_at: selectedCount > 0 ? null : new Date().toISOString(),
      result_payload: selectedCount > 0 ? null : [],
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createCdnUploadBatches(rows) {
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .insert(rows)
    .select("*");

  if (error) throw error;
  return data ?? [];
}

export async function getCdnUploadJob(jobId) {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listCdnUploadBatches(jobId) {
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .select(
      "id, job_id, batch_index, status, business_ids, result_payload, succeeded_count, failed_count, skipped_count, failed_data, created_at, started_at, completed_at, failed_at"
    )
    .eq("job_id", jobId)
    .order("batch_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCdnUploadJobDetail(jobId) {
  const job = await getCdnUploadJob(jobId);
  if (!job) return null;

  const batches = await listCdnUploadBatches(jobId);
  const stats = summarizeBatchStatuses(batches);
  const result_payload = mergeBatchResults(batches);

  return {
    job: {
      ...job,
      ...stats,
      result_payload,
    },
    batches: batches.map((batch) => ({
      ...batch,
      business_count: Array.isArray(batch.business_ids)
        ? batch.business_ids.length
        : 0,
    })),
  };
}

export async function listCdnUploadJobs() {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .select(
      "id, status, limit_count, selected_count, succeeded_count, failed_count, skipped_count, created_at, started_at, completed_at, failed_at, cdn_upload_batches(id, status)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((job) => {
    const batches = job.cdn_upload_batches ?? [];
    const stats = summarizeBatchStatuses(batches);
    const { cdn_upload_batches: _batches, ...rest } = job;
    return { ...rest, ...stats };
  });
}

export async function hasActiveCdnUploadJob() {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .select("id")
    .in("status", ["pending", "running"])
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markCdnUploadJobRunning(jobId) {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .in("status", ["pending", "running"])
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCdnUploadBatch(batchId) {
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .select("*")
    .eq("id", batchId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function claimCdnUploadBatch(batchId) {
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", batchId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function completeCdnUploadBatch(batchId, patch) {
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      failed_at: null,
      failed_data: null,
      ...patch,
    })
    .eq("id", batchId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function failCdnUploadBatch(batchId, failedData) {
  const { data, error } = await supabase
    .from("cdn_upload_batches")
    .update({
      status: "failed",
      failed_at: new Date().toISOString(),
      failed_data: failedData,
      completed_at: null,
    })
    .eq("id", batchId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function refreshCdnUploadJobProgress(jobId) {
  const batches = await listCdnUploadBatches(jobId);
  const succeeded_count = batches.reduce(
    (sum, batch) => sum + (batch.succeeded_count || 0),
    0
  );
  const failed_count = batches.reduce(
    (sum, batch) => sum + (batch.failed_count || 0),
    0
  );
  const skipped_count = batches.reduce(
    (sum, batch) => sum + (batch.skipped_count || 0),
    0
  );
  const result_payload = mergeBatchResults(batches);
  const allTerminal =
    batches.length > 0 &&
    batches.every((batch) =>
      ["completed", "failed"].includes(batch.status)
    );
  const anyFailed = batches.some((batch) => batch.status === "failed");

  const patch = {
    succeeded_count,
    failed_count,
    skipped_count,
    result_payload,
  };

  if (allTerminal) {
    patch.status = anyFailed ? "failed" : "completed";
    patch.completed_at = new Date().toISOString();
    if (anyFailed) {
      patch.failed_at = new Date().toISOString();
      patch.failed_data = {
        code: "cdn_upload_batch_failed",
        message: "One or more CDN upload batches failed.",
      };
    } else {
      patch.failed_at = null;
      patch.failed_data = null;
    }
  } else {
    patch.status = "running";
  }

  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .update(patch)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCdnUploadJobs(jobIds) {
  const { data, error } = await supabase
    .from("cdn_upload_jobs")
    .delete()
    .in("id", jobIds)
    .in("status", ["completed", "failed"])
    .select("id");

  if (error) throw error;
  return data ?? [];
}

export async function countPendingCdnBusinesses() {
  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("cdn_stored", false)
    .not("place_id", "is", null)
    .lt("cdn_stored_attempts", MAX_CDN_STORED_ATTEMPTS);

  if (error) throw error;
  return count ?? 0;
}

export async function selectPendingCdnBusinesses(limitCount) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, place_id, slug, title, created_at, cdn_stored_attempts")
    .eq("cdn_stored", false)
    .not("place_id", "is", null)
    .lt("cdn_stored_attempts", MAX_CDN_STORED_ATTEMPTS)
    .order("cdn_stored_attempts", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return data ?? [];
}

export async function getBusinessesByIds(businessIds) {
  if (!businessIds?.length) return [];

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, place_id, slug, title, created_at, cdn_stored, cdn_stored_attempts"
    )
    .in("id", businessIds);

  if (error) throw error;

  const byId = new Map((data ?? []).map((row) => [row.id, row]));
  return businessIds.map((id) => byId.get(id)).filter(Boolean);
}

async function hydrateCdnBatchBusinesses(batch) {
  const businessIds = Array.isArray(batch?.business_ids)
    ? batch.business_ids
    : [];
  const outcomes = Array.isArray(batch?.result_payload)
    ? batch.result_payload
    : [];
  const outcomeById = new Map(
    outcomes
      .filter((row) => row?.business_id)
      .map((row) => [String(row.business_id), row])
  );

  if (businessIds.length === 0) {
    return outcomes.map((row) => ({
      id: row.business_id ?? null,
      title: row.title ?? null,
      slug: row.slug ?? null,
      place_id: row.place_id ?? null,
      cdn_stored: null,
      cdn_stored_attempts: null,
      outcome_status: row.status ?? null,
      error: row.error ?? null,
      image_id: row.image_id ?? null,
    }));
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, title, slug, place_id, cdn_stored, cdn_stored_attempts, address"
    )
    .in("id", businessIds);

  if (error) throw error;

  const byId = new Map((data ?? []).map((row) => [String(row.id), row]));

  return businessIds.map((id) => {
    const key = String(id);
    const live = byId.get(key);
    const outcome = outcomeById.get(key);

    return {
      id,
      title: live?.title ?? outcome?.title ?? null,
      slug: live?.slug ?? outcome?.slug ?? null,
      place_id: live?.place_id ?? outcome?.place_id ?? null,
      address: live?.address ?? null,
      cdn_stored: live?.cdn_stored ?? null,
      cdn_stored_attempts: live?.cdn_stored_attempts ?? null,
      outcome_status: outcome?.status ?? null,
      error: outcome?.error ?? null,
      image_id: outcome?.image_id ?? null,
    };
  });
}

export async function getCdnUploadBatchDetail(batchId) {
  const batch = await getCdnUploadBatch(batchId);
  if (!batch) return null;

  const job = await getCdnUploadJob(batch.job_id);
  const businesses = await hydrateCdnBatchBusinesses(batch);

  return {
    batch: {
      id: batch.id,
      job_id: batch.job_id,
      batch_index: batch.batch_index,
      status: batch.status,
      business_count: Array.isArray(batch.business_ids)
        ? batch.business_ids.length
        : 0,
      succeeded_count: batch.succeeded_count ?? 0,
      failed_count: batch.failed_count ?? 0,
      skipped_count: batch.skipped_count ?? 0,
      failed_data: batch.failed_data ?? null,
      created_at: batch.created_at,
      started_at: batch.started_at,
      completed_at: batch.completed_at,
      failed_at: batch.failed_at,
    },
    job: job
      ? {
          id: job.id,
          status: job.status,
          selected_count: job.selected_count ?? 0,
          succeeded_count: job.succeeded_count ?? 0,
          failed_count: job.failed_count ?? 0,
          skipped_count: job.skipped_count ?? 0,
        }
      : null,
    businesses,
  };
}

export async function incrementCdnStoredAttempts(businessId, currentAttempts = 0) {
  const nextAttempts = Math.max(0, Number(currentAttempts) || 0) + 1;
  const { data, error } = await supabase
    .from("businesses")
    .update({ cdn_stored_attempts: nextAttempts })
    .eq("id", businessId)
    .select("id, cdn_stored_attempts")
    .single();

  if (error) throw error;
  return data;
}

export async function insertPrimaryBusinessImage({ imageId, businessId }) {
  const { data, error } = await supabase
    .from("business_images")
    .insert({
      image_id: imageId,
      business_id: businessId,
      is_primary: true,
    })
    .select("image_id, business_id, is_primary")
    .single();

  if (error) throw error;
  return data;
}

export async function markBusinessCdnStored(businessId) {
  const { data, error } = await supabase
    .from("businesses")
    .update({ cdn_stored: true })
    .eq("id", businessId)
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

function sanitizeCdnBusinessSearch(q) {
  return sanitizeIlikeSearch(q);
}

export async function listCdnUploadBusinesses(
  page = 1,
  limit = 20,
  { q = null, cdnStored = null, hasAttempts = null } = {}
) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 20));
  const search = sanitizeCdnBusinessSearch(q);

  let query = supabase
    .from("businesses")
    .select(
      "id, title, slug, cdn_stored, cdn_stored_attempts, created_at, image_url",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (cdnStored === true || cdnStored === false) {
    query = query.eq("cdn_stored", cdnStored);
  }

  if (hasAttempts === true) {
    query = query.gt("cdn_stored_attempts", 0);
  } else if (hasAttempts === false) {
    query = query.eq("cdn_stored_attempts", 0);
  }

  if (search) {
    query = query.or(buildIlikeOrFilter(["title", "slug"], search));
  }

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) throw error;

  return {
    businesses: data ?? [],
    count: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
}
