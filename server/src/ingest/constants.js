/** Ingest enrich runs up to 20 sequential Claude calls and can take many minutes. */
export const INGEST_ENRICH_JOB_LOCK_DURATION_MS = 900_000;
export const INGEST_ENRICH_STALLED_INTERVAL_MS = 600_000;

/** Insert processes a full enriched batch and may run for several minutes. */
export const INGEST_INSERT_JOB_LOCK_DURATION_MS = 600_000;
export const INGEST_INSERT_STALLED_INTERVAL_MS = 300_000;
