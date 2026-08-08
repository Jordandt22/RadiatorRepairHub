import { supabase } from "../supabase/supabase.js";
import { MAX_EMAIL_SCRAPED_ATTEMPTS } from "./constants.js";

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

export async function createEmailScrapeJob({
  limitCount = 300,
  selectedCount = 0,
} = {}) {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
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

export async function createEmailScrapeBatches(rows) {
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from("email_scrape_batches")
    .insert(rows)
    .select("*");

  if (error) throw error;
  return data ?? [];
}

export async function getEmailScrapeJob(jobId) {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listEmailScrapeBatches(jobId) {
  const { data, error } = await supabase
    .from("email_scrape_batches")
    .select(
      "id, job_id, batch_index, status, business_ids, result_payload, succeeded_count, failed_count, skipped_count, failed_data, created_at, started_at, completed_at, failed_at"
    )
    .eq("job_id", jobId)
    .order("batch_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getEmailScrapeJobDetail(jobId) {
  const job = await getEmailScrapeJob(jobId);
  if (!job) return null;

  const batches = await listEmailScrapeBatches(jobId);
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

export async function listEmailScrapeJobs() {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
    .select(
      "id, status, limit_count, selected_count, succeeded_count, failed_count, skipped_count, created_at, started_at, completed_at, failed_at, email_scrape_batches(id, status)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((job) => {
    const batches = job.email_scrape_batches ?? [];
    const stats = summarizeBatchStatuses(batches);
    const { email_scrape_batches: _batches, ...rest } = job;
    return { ...rest, ...stats };
  });
}

export async function hasActiveEmailScrapeJob() {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
    .select("id")
    .in("status", ["pending", "running"])
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markEmailScrapeJobRunning(jobId) {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
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

export async function getEmailScrapeBatch(batchId) {
  const { data, error } = await supabase
    .from("email_scrape_batches")
    .select("*")
    .eq("id", batchId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function claimEmailScrapeBatch(batchId) {
  const { data, error } = await supabase
    .from("email_scrape_batches")
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

export async function completeEmailScrapeBatch(batchId, patch) {
  const { data, error } = await supabase
    .from("email_scrape_batches")
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

export async function failEmailScrapeBatch(batchId, failedData) {
  const { data, error } = await supabase
    .from("email_scrape_batches")
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

export async function refreshEmailScrapeJobProgress(jobId) {
  const batches = await listEmailScrapeBatches(jobId);
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
        code: "email_scrape_batch_failed",
        message: "One or more email scrape batches failed.",
      };
    } else {
      patch.failed_at = null;
      patch.failed_data = null;
    }
  } else {
    patch.status = "running";
  }

  const { data, error } = await supabase
    .from("email_scrape_jobs")
    .update(patch)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmailScrapeJobs(jobIds) {
  const { data, error } = await supabase
    .from("email_scrape_jobs")
    .delete()
    .in("id", jobIds)
    .in("status", ["completed", "failed"])
    .select("id");

  if (error) throw error;
  return data ?? [];
}

export async function countPendingEmailScrapeBusinesses() {
  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .not("website", "is", null)
    .neq("website", "")
    .or("email.is.null,email.eq.")
    .lt("email_scraped_attempts", MAX_EMAIL_SCRAPED_ATTEMPTS)
    .neq("email_status", "unable_to_find");

  if (error) throw error;
  return count ?? 0;
}

export async function selectPendingEmailScrapeBusinesses(limitCount) {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, website, slug, title, email, email_scraped_attempts, created_at"
    )
    .not("website", "is", null)
    .neq("website", "")
    .or("email.is.null,email.eq.")
    .lt("email_scraped_attempts", MAX_EMAIL_SCRAPED_ATTEMPTS)
    .neq("email_status", "unable_to_find")
    .order("email_scraped_attempts", { ascending: true })
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
      "id, website, slug, title, email, email_scraped_attempts, email_status"
    )
    .in("id", businessIds);

  if (error) throw error;

  const byId = new Map((data ?? []).map((row) => [row.id, row]));
  return businessIds.map((id) => byId.get(id)).filter(Boolean);
}

async function hydrateEmailScrapeBatchBusinesses(batch) {
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
      website: row.website ?? null,
      email: row.email ?? null,
      email_scraped_attempts: null,
      outcome_status: row.status ?? null,
      outcome_email: row.email ?? null,
      reason: row.reason ?? row.error ?? null,
    }));
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, title, slug, website, email, email_scraped_attempts, address"
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
      website: live?.website ?? outcome?.website ?? null,
      address: live?.address ?? null,
      email: live?.email ?? null,
      email_scraped_attempts: live?.email_scraped_attempts ?? null,
      outcome_status: outcome?.status ?? null,
      outcome_email: outcome?.email ?? null,
      reason: outcome?.reason ?? outcome?.error ?? null,
    };
  });
}

export async function getEmailScrapeBatchDetail(batchId) {
  const batch = await getEmailScrapeBatch(batchId);
  if (!batch) return null;

  const job = await getEmailScrapeJob(batch.job_id);
  const businesses = await hydrateEmailScrapeBatchBusinesses(batch);

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

export async function incrementEmailScrapedAttempts(
  businessId,
  currentAttempts = 0
) {
  const nextAttempts = Math.max(0, Number(currentAttempts) || 0) + 1;
  const { data, error } = await supabase
    .from("businesses")
    .update({ email_scraped_attempts: nextAttempts })
    .eq("id", businessId)
    .select("id, email_scraped_attempts")
    .single();

  if (error) throw error;
  return data;
}

export async function setBusinessEmail(businessId, email) {
  const { data, error } = await supabase
    .from("businesses")
    .update({ email })
    .eq("id", businessId)
    .select("id, email")
    .single();

  if (error) throw error;
  return data;
}

function sanitizeEmailScrapeBusinessSearch(q) {
  if (!q) return null;
  return String(q)
    .replace(/[%_,()\"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export async function listEmailScrapeBusinesses(
  page = 1,
  limit = 20,
  { q = null, hasEmail = null, hasAttempts = null, emailStatus = null } = {}
) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 20));
  const search = sanitizeEmailScrapeBusinessSearch(q);

  let query = supabase
    .from("businesses")
    .select(
      "id, title, slug, website, email, email_scraped_attempts, email_status, email_status_marked_at, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (hasEmail === true) {
    query = query.not("email", "is", null).neq("email", "");
  } else if (hasEmail === false) {
    query = query.or("email.is.null,email.eq.");
  }

  if (hasAttempts === true) {
    query = query.gt("email_scraped_attempts", 0);
  } else if (hasAttempts === false) {
    query = query.eq("email_scraped_attempts", 0);
  }

  if (emailStatus) {
    query = query.eq("email_status", emailStatus);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,slug.ilike.%${search}%,website.ilike.%${search}%,email.ilike.%${search}%`
    );
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
