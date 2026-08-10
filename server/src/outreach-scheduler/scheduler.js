import { getOutreachSchedule } from "./db.js";
import {
  buildOutreachCronPattern,
  OUTREACH_SCHEDULER_ID,
} from "./constants.js";
import { getOutreachDispatchQueue } from "./queues.js";

function serializeSchedulerState(scheduler) {
  if (!scheduler) return null;
  return {
    id: scheduler.id ?? scheduler.key ?? OUTREACH_SCHEDULER_ID,
    name: scheduler.name ?? "dispatch-scheduled-outreach",
    next:
      typeof scheduler.next === "number"
        ? new Date(scheduler.next).toISOString()
        : scheduler.next ?? null,
    pattern: scheduler.pattern ?? null,
    timezone: scheduler.tz ?? null,
  };
}

export async function getOutreachSchedulerState() {
  const scheduler = await getOutreachDispatchQueue().getJobScheduler(
    OUTREACH_SCHEDULER_ID
  );
  return serializeSchedulerState(scheduler);
}

export async function reconcileOutreachScheduler(scheduleOverride = null) {
  const schedule = scheduleOverride ?? (await getOutreachSchedule());
  const queue = getOutreachDispatchQueue();
  if (!schedule.enabled) {
    await queue.removeJobScheduler(OUTREACH_SCHEDULER_ID);
    return null;
  }

  const job = await queue.upsertJobScheduler(
    OUTREACH_SCHEDULER_ID,
    {
      pattern: buildOutreachCronPattern(schedule.local_time),
      tz: schedule.timezone,
    },
    {
      name: "dispatch-scheduled-outreach",
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
    id: OUTREACH_SCHEDULER_ID,
    next: job?.timestamp
      ? new Date(job.timestamp + (job.delay ?? 0)).toISOString()
      : null,
    pattern: buildOutreachCronPattern(schedule.local_time),
    timezone: schedule.timezone,
  };
}
