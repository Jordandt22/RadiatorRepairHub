import {
  PHONE_LINE_TYPE_DEFAULT_LIMIT,
  PHONE_LINE_TYPE_MAX_LIMIT,
  PHONE_LINE_TYPE_MIN_LIMIT,
} from "../lib/phoneLineType.js";
import { listUncheckedPhoneLineTypeBusinesses } from "../supabase/supabase.functions.js";
import { createPhoneLineTypeJob, markPhoneLineTypeJobFailed } from "./db.js";
import { enqueuePhoneLineTypeJob } from "./queues.js";

export async function startPhoneLineTypeJob({
  limitCount = PHONE_LINE_TYPE_DEFAULT_LIMIT,
} = {}) {
  const limit = Math.min(
    PHONE_LINE_TYPE_MAX_LIMIT,
    Math.max(PHONE_LINE_TYPE_MIN_LIMIT, Number(limitCount) || PHONE_LINE_TYPE_DEFAULT_LIMIT)
  );
  const { data: rows, error } = await listUncheckedPhoneLineTypeBusinesses(limit);
  if (error) throw error;

  const businesses = rows ?? [];
  const job = await createPhoneLineTypeJob({
    limitCount: limit,
    selectedCount: businesses.length,
    businessIds: businesses.map((row) => row.id),
  });

  if (businesses.length === 0) {
    return { job };
  }

  try {
    await enqueuePhoneLineTypeJob(job.id);
  } catch (enqueueError) {
    await markPhoneLineTypeJobFailed(job.id, enqueueError?.message);
    throw enqueueError;
  }

  return { job };
}
