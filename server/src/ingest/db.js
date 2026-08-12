import { supabase } from "../supabase/supabase.js";

export async function createIngestGroup({ name, payload }) {
  const { data, error } = await supabase
    .from("ingest_groups")
    .insert({
      name,
      payload,
      status: "pending",
    })
    .select("id, name, status, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function getIngestGroup(groupId) {
  const { data, error } = await supabase
    .from("ingest_groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateIngestGroup(groupId, patch) {
  const { data, error } = await supabase
    .from("ingest_groups")
    .update(patch)
    .eq("id", groupId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createIngestJob({ groupId, batchId = null, jobType }) {
  const { data, error } = await supabase
    .from("ingest_jobs")
    .insert({
      group_id: groupId,
      batch_id: batchId,
      job_type: jobType,
      status: "running",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function completeIngestJob(jobId) {
  const { data, error } = await supabase
    .from("ingest_jobs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      failed_at: null,
      failed_data: null,
    })
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function failIngestJob(jobId, failedData) {
  const { data, error } = await supabase
    .from("ingest_jobs")
    .update({
      status: "failed",
      failed_at: new Date().toISOString(),
      failed_data: failedData,
      completed_at: null,
    })
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createIngestBatches(rows) {
  if (!rows.length) return [];
  const { data, error } = await supabase
    .from("ingest_batches")
    .insert(rows)
    .select("id, group_id, status");

  if (error) throw error;
  return data;
}

export async function getIngestBatch(batchId) {
  const { data, error } = await supabase
    .from("ingest_batches")
    .select("*")
    .eq("id", batchId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Look up which place_ids already exist in businesses.
 * @param {string[]} placeIds
 * @returns {Promise<Set<string>>}
 */
export async function findExistingPlaceIds(placeIds = []) {
  const unique = [
    ...new Set(
      placeIds
        .map((id) => (id == null ? null : String(id).trim()))
        .filter(Boolean),
    ),
  ];
  if (unique.length === 0) return new Set();

  const existing = new Set();
  const chunkSize = 200;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from("businesses")
      .select("place_id")
      .in("place_id", chunk);
    if (error) throw error;
    for (const row of data || []) {
      if (row.place_id) existing.add(String(row.place_id));
    }
  }
  return existing;
}

export async function claimBatchJob(batchId, jobId, batchStatus) {
  const { data, error } = await supabase.rpc("ingest_claim_batch_job", {
    p_batch_id: batchId,
    p_job_id: jobId,
    p_batch_status: batchStatus,
  });

  if (error) throw error;
  return data;
}

export async function finishBatchJob({
  batchId,
  jobId,
  jobStatus,
  batchStatus,
  resultPayload,
  failedEnrichmentPayload,
  failedInsertionPayload,
  failedData,
  updateResultPayload = false,
  updateFailedEnrichment = false,
  updateFailedInsertion = false,
}) {
  const { data, error } = await supabase.rpc("ingest_finish_batch_job", {
    p_batch_id: batchId,
    p_job_id: jobId,
    p_job_status: jobStatus,
    p_batch_status: batchStatus,
    p_result_payload: resultPayload ?? null,
    p_failed_enrichment_payload: failedEnrichmentPayload ?? null,
    p_failed_insertion_payload: failedInsertionPayload ?? null,
    p_failed_data: failedData ?? null,
    p_update_result_payload: updateResultPayload,
    p_update_failed_enrichment: updateFailedEnrichment,
    p_update_failed_insertion: updateFailedInsertion,
  });

  if (error) throw error;
  return data;
}

export async function maybeCompleteGroup(groupId) {
  const { data: batches, error } = await supabase
    .from("ingest_batches")
    .select("id, status")
    .eq("group_id", groupId);

  if (error) throw error;
  if (!batches?.length) {
    await updateIngestGroup(groupId, { status: "completed" });
    return;
  }

  const terminal = new Set(["completed", "failed"]);
  const allDone = batches.every((b) => terminal.has(b.status));
  if (!allDone) return;

  const anyCompleted = batches.some((b) => b.status === "completed");
  await updateIngestGroup(groupId, {
    status: anyCompleted ? "completed" : "failed",
  });
}

function summarizeBatch(batch) {
  const initialCount = Array.isArray(batch.initial_payload)
    ? batch.initial_payload.length
    : 0;
  const resultCount = Array.isArray(batch.result_payload)
    ? batch.result_payload.length
    : 0;
  const failedEnrichCount = Array.isArray(batch.failed_enrichment_payload)
    ? batch.failed_enrichment_payload.length
    : 0;
  const failedInsertCount = Array.isArray(batch.failed_insertion_payload)
    ? batch.failed_insertion_payload.length
    : 0;

  return {
    id: batch.id,
    group_id: batch.group_id,
    status: batch.status,
    current_job_id: batch.current_job_id,
    created_at: batch.created_at,
    updated_at: batch.updated_at,
    initial_count: initialCount,
    result_count: resultCount,
    failed_enrichment_count: failedEnrichCount,
    failed_insertion_count: failedInsertCount,
  };
}

export async function listIngestGroups() {
  const { data: groups, error } = await supabase
    .from("ingest_groups")
    .select("id, name, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const groupIds = (groups || []).map((g) => g.id);
  if (groupIds.length === 0) return [];

  const [{ data: batches, error: batchesError }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase
        .from("ingest_batches")
        .select("id, group_id, status, result_payload")
        .in("group_id", groupIds),
      supabase
        .from("ingest_jobs")
        .select("id, group_id, status")
        .in("group_id", groupIds),
    ]);

  if (batchesError) throw batchesError;
  if (jobsError) throw jobsError;

  const processingStatuses = new Set(["pending", "enriching", "inserting"]);

  return (groups || []).map((group) => {
    const groupBatches = (batches || []).filter((b) => b.group_id === group.id);
    const groupJobs = (jobs || []).filter((j) => j.group_id === group.id);
    const insertedCount = groupBatches.reduce((sum, batch) => {
      if (batch.status !== "completed") return sum;
      return (
        sum +
        (Array.isArray(batch.result_payload) ? batch.result_payload.length : 0)
      );
    }, 0);

    return {
      id: group.id,
      name: group.name,
      status: group.status,
      created_at: group.created_at,
      inserted_count: insertedCount,
      total_batches: groupBatches.length,
      processing_batches: groupBatches.filter((b) =>
        processingStatuses.has(b.status)
      ).length,
      total_jobs: groupJobs.length,
      running_jobs: groupJobs.filter((j) => j.status === "running").length,
    };
  });
}

export async function deleteIngestGroups(groupIds) {
  const ids = Array.isArray(groupIds) ? groupIds.filter(Boolean) : [];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("ingest_groups")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw error;
  return data ?? [];
}

export async function getIngestGroupDetail(groupId) {
  const group = await getIngestGroup(groupId);
  if (!group) return null;

  const [{ data: batches, error: batchesError }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase
        .from("ingest_batches")
        .select(
          "id, group_id, status, current_job_id, created_at, updated_at, initial_payload, result_payload, failed_enrichment_payload, failed_insertion_payload"
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ingest_jobs")
        .select(
          "id, group_id, batch_id, job_type, status, failed_data, created_at, completed_at, failed_at"
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true }),
    ]);

  if (batchesError) throw batchesError;
  if (jobsError) throw jobsError;

  const filteredOutCount = Array.isArray(group.filtered_out_payload)
    ? group.filtered_out_payload.length
    : 0;

  const insertedRows = (batches || [])
    .filter((batch) => batch.status === "completed")
    .flatMap((batch) =>
      Array.isArray(batch.result_payload) ? batch.result_payload : []
    );
  const inserted = await hydrateInsertedBusinesses(insertedRows);

  return {
    group: {
      id: group.id,
      name: group.name,
      status: group.status,
      created_at: group.created_at,
      filtered_out_count: filteredOutCount,
      filtered_out: Array.isArray(group.filtered_out_payload)
        ? group.filtered_out_payload
        : [],
      payload_count: Array.isArray(group.payload) ? group.payload.length : 0,
      inserted_count: inserted.length,
      inserted,
    },
    batches: (batches || []).map(summarizeBatch),
    jobs: jobs || [],
  };
}

export async function getIngestBatchDetail(batchId) {
  const batch = await getIngestBatch(batchId);
  if (!batch) return null;

  const group = await getIngestGroup(batch.group_id);
  const summary = summarizeBatch(batch);
  const inserted = await hydrateInsertedBusinesses(
    Array.isArray(batch.result_payload) ? batch.result_payload : [],
  );

  return {
    batch: {
      ...summary,
      inserted,
      insert_failed: Array.isArray(batch.failed_insertion_payload)
        ? batch.failed_insertion_payload
        : [],
      enrich_failed: Array.isArray(batch.failed_enrichment_payload)
        ? batch.failed_enrichment_payload
        : [],
    },
    group: group
      ? {
          id: group.id,
          name: group.name,
          status: group.status,
        }
      : null,
  };
}

async function hydrateInsertedBusinesses(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const ids = [
    ...new Set(rows.map((row) => row?.id).filter(Boolean).map(String)),
  ];
  if (ids.length === 0) return rows;

  const byId = new Map();
  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "id, title, place_id, slug, total_score, city:cities(name, slug), state:states(name, code), postal_code:postal_codes(code), primary_category:primary_categories(name)",
      )
      .in("id", chunk);
    if (error) throw error;
    for (const row of data || []) {
      byId.set(String(row.id), row);
    }
  }

  return rows.map((row) => {
    const live = row?.id ? byId.get(String(row.id)) : null;
    if (!live) {
      return {
        id: row.id ?? null,
        title: row.title ?? null,
        place_id: row.place_id ?? row.placeId ?? null,
        slug: row.slug ?? null,
        primary_category:
          row.primary_category || row.categoryName || row.category_name || null,
        city: row.city ?? null,
        city_slug: row.city_slug ?? null,
        state: row.state ?? null,
        state_code: row.state_code ?? null,
        postal_code: row.postal_code ?? row.postalCode ?? null,
        total_score: row.total_score ?? row.totalScore ?? null,
      };
    }

    return {
      id: live.id,
      title: live.title ?? row.title ?? null,
      place_id: live.place_id ?? row.place_id ?? null,
      slug: live.slug ?? row.slug ?? null,
      primary_category: live.primary_category?.name ?? null,
      city: live.city?.name ?? null,
      city_slug: live.city?.slug ?? null,
      state: live.state?.name ?? live.state?.code ?? null,
      state_code: live.state?.code ?? null,
      postal_code: live.postal_code?.code ?? null,
      total_score: live.total_score ?? null,
    };
  });
}
