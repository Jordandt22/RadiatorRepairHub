export const OUTREACH_SCHEDULER_ID = "weekday-claim-invite-outreach";
export const OUTREACH_DISPATCH_QUEUE_NAME = "outreach-dispatch";
export const OUTREACH_SEND_QUEUE_NAME = "outreach-send";
export const OUTREACH_TIMEZONE = "America/Los_Angeles";
export const OUTREACH_DEFAULT_TIME = "08:00";
export const OUTREACH_WEEKDAYS = [1, 2, 3, 4, 5];
export const OUTREACH_LIMIT_OPTIONS = [10, 25, 50, 75];
export const SCHEDULED_OUTREACH_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
  "claim_followup",
];

export function buildOutreachCronPattern(localTime) {
  const [hour, minute] = String(localTime || OUTREACH_DEFAULT_TIME)
    .split(":")
    .map(Number);
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid outreach scheduler time");
  }
  return `0 ${minute} ${hour} * * 1-5`;
}

export function buildOutreachSendQueueJobId(
  runId,
  outreachType,
  chunkIndex = 0
) {
  return `${runId}-${outreachType}-${chunkIndex}`;
}

export function buildOutreachIdempotencyKey(sendJobId) {
  return `outreach-${sendJobId}`;
}
