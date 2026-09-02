import { getDigestSchedule } from "./db.js";
import {
  buildDigestCronPattern,
  DIGEST_SCHEDULER_ID,
} from "./constants.js";
import { getDigestDispatchQueue } from "./queues.js";

function serializeSchedulerState(scheduler) {
  if (!scheduler) return null;
  return {
    id: scheduler.id ?? scheduler.key ?? DIGEST_SCHEDULER_ID,
    name: scheduler.name ?? "dispatch-scheduled-digest",
    next:
      typeof scheduler.next === "number"
        ? new Date(scheduler.next).toISOString()
        : scheduler.next ?? null,
    pattern: scheduler.pattern ?? null,
    timezone: scheduler.tz ?? null,
  };
}

export async function getDigestSchedulerState() {
  const scheduler = await getDigestDispatchQueue().getJobScheduler(
    DIGEST_SCHEDULER_ID
  );
  return serializeSchedulerState(scheduler);
}

export async function reconcileDigestScheduler(scheduleOverride = null) {
  const schedule = scheduleOverride ?? (await getDigestSchedule());
  const queue = getDigestDispatchQueue();
  if (!schedule.enabled) {
    await queue.removeJobScheduler(DIGEST_SCHEDULER_ID);
    return null;
  }

  const job = await queue.upsertJobScheduler(
    DIGEST_SCHEDULER_ID,
    {
      pattern: buildDigestCronPattern(schedule.local_time, schedule.weekday),
      tz: schedule.timezone,
    },
    {
      name: "dispatch-scheduled-digest",
      data: {},
      opts: {
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 3,
        backoff: { type: "exponential", delay: 30_000 },
      },
    }
  );
  return {
    id: DIGEST_SCHEDULER_ID,
    next: job?.timestamp
      ? new Date(job.timestamp + (job.delay ?? 0)).toISOString()
      : null,
    pattern: buildDigestCronPattern(schedule.local_time, schedule.weekday),
    timezone: schedule.timezone,
  };
}
