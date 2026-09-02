export const DIGEST_SCHEDULER_ID = "weekly-digest";
export const DIGEST_DISPATCH_QUEUE_NAME = "digest-dispatch";
export const DIGEST_SEND_QUEUE_NAME = "digest-send";
export const DIGEST_TIMEZONE = "America/Los_Angeles";
export const DIGEST_DEFAULT_TIME = "09:00";
export const DIGEST_DEFAULT_WEEKDAY = 1;
export const DIGEST_LIMIT_OPTIONS = [100, 200, 500, 1000, 2500, 5000, 10000];
export const SCHEDULED_DIGEST_SEGMENTS = ["unclaimed", "claimed"];

export function buildDigestCronPattern(localTime, weekday = DIGEST_DEFAULT_WEEKDAY) {
  const [hour, minute] = String(localTime || DIGEST_DEFAULT_TIME)
    .split(":")
    .map(Number);
  const day = Number(weekday);
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59 ||
    !Number.isInteger(day) ||
    day < 0 ||
    day > 6
  ) {
    throw new Error("Invalid digest scheduler time");
  }
  return `0 ${minute} ${hour} * * ${day}`;
}

export function buildDigestSendQueueJobId(runId, digestSegment) {
  return `${runId}-${digestSegment}`;
}

export function buildDigestIdempotencyKey(sendJobId) {
  return `digest-${sendJobId}`;
}
