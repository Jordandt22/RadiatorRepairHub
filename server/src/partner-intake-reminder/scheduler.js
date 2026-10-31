import {
  PARTNER_INTAKE_REMINDER_CRON,
  PARTNER_INTAKE_REMINDER_SCHEDULER_ID,
  PARTNER_INTAKE_REMINDER_TIMEZONE,
} from "./constants.js";
import { getPartnerIntakeReminderQueue } from "./queues.js";

export async function reconcilePartnerIntakeReminderScheduler() {
  const queue = getPartnerIntakeReminderQueue();
  const job = await queue.upsertJobScheduler(
    PARTNER_INTAKE_REMINDER_SCHEDULER_ID,
    {
      pattern: PARTNER_INTAKE_REMINDER_CRON,
      tz: PARTNER_INTAKE_REMINDER_TIMEZONE,
    },
    {
      name: "send-partner-intake-day2-reminders",
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
    id: PARTNER_INTAKE_REMINDER_SCHEDULER_ID,
    next: job?.timestamp
      ? new Date(job.timestamp + (job.delay ?? 0)).toISOString()
      : null,
    pattern: PARTNER_INTAKE_REMINDER_CRON,
    timezone: PARTNER_INTAKE_REMINDER_TIMEZONE,
  };
}
