import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";
import { PARTNER_INTAKE_REMINDER_QUEUE_NAME } from "./constants.js";

let reminderQueue = null;

export function getPartnerIntakeReminderQueue() {
  if (!reminderQueue) {
    reminderQueue = new Queue(PARTNER_INTAKE_REMINDER_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return reminderQueue;
}

export async function closePartnerIntakeReminderQueue() {
  if (!reminderQueue) return;
  await reminderQueue.close();
  reminderQueue = null;
}
