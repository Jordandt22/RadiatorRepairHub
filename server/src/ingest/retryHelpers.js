import { INGEST_ENRICH_JOB_LOCK_DURATION_MS } from "./constants.js";

/**
 * Resolve which pipeline step to retry.
 * @param {{ result_payload?: unknown } | null | undefined} batch
 * @param {'auto' | 'enrich' | 'insert'} [step]
 * @returns {'enrich' | 'insert'}
 */
export function resolveRetryStep(batch, step = "auto") {
  if (step === "enrich" || step === "insert") return step;
  if (Array.isArray(batch?.result_payload) && batch.result_payload.length > 0) {
    return "insert";
  }
  return "enrich";
}

/**
 * @param {{ status?: string, updated_at?: string | null, result_payload?: unknown } | null | undefined} batch
 * @param {{ now?: number, staleMs?: number, step?: 'auto' | 'enrich' | 'insert' }} [options]
 * @returns {{ eligible: boolean, step: 'enrich' | 'insert' | null, reason: string | null }}
 */
export function getBatchRetryInfo(
  batch,
  {
    now = Date.now(),
    staleMs = INGEST_ENRICH_JOB_LOCK_DURATION_MS,
    step = "auto",
  } = {}
) {
  if (!batch) {
    return { eligible: false, step: null, reason: "Batch not found" };
  }

  const resolvedStep = resolveRetryStep(batch, step);

  if (resolvedStep === "insert") {
    if (
      !Array.isArray(batch.result_payload) ||
      batch.result_payload.length === 0
    ) {
      return {
        eligible: false,
        step: null,
        reason: "No enriched result payload to insert",
      };
    }
  }

  const status = batch.status;

  if (status === "completed") {
    return {
      eligible: false,
      step: null,
      reason: "Completed batches cannot be retried",
    };
  }

  if (status === "failed" || status === "pending") {
    return { eligible: true, step: resolvedStep, reason: null };
  }

  if (status === "enriching" || status === "inserting") {
    const updatedAtMs = batch.updated_at
      ? new Date(batch.updated_at).getTime()
      : NaN;
    if (!Number.isFinite(updatedAtMs)) {
      return {
        eligible: false,
        step: null,
        reason: "Batch is still active",
      };
    }
    if (now - updatedAtMs >= staleMs) {
      return { eligible: true, step: resolvedStep, reason: null };
    }
    return {
      eligible: false,
      step: null,
      reason: "Batch is still active",
    };
  }

  return {
    eligible: false,
    step: null,
    reason: `Cannot retry batch with status "${status}"`,
  };
}

/**
 * @param {{ status?: string, updated_at?: string | null, result_payload?: unknown } | null | undefined} batch
 * @param {{ now?: number, staleMs?: number }} [options]
 * @returns {boolean}
 */
export function isBatchRetryEligible(batch, options = {}) {
  return getBatchRetryInfo(batch, options).eligible;
}
