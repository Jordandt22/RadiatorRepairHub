import { twilioClient } from "./twilio.js";
import { getCacheData, getPhoneLookupKey, setWithExactTtl } from "../redis/redis.js";

/**
 * Twilio Lookup v2 with line type intelligence. Results are cached so a
 * resend or a repeat claim attempt does not bill a second lookup.
 * @see https://www.twilio.com/docs/lookup/v2-api
 */

/** Line types we refuse to place verification calls to. */
export const BLOCKED_LINE_TYPES = new Set([
  "tollFree",
  "premium",
  "sharedCost",
  "uan",
  "voicemail",
  "pager",
]);

export async function lookupPhoneLineType(phoneE164) {
  const { key, interval } = getPhoneLookupKey(phoneE164);

  try {
    const cached = await getCacheData(key);
    if (cached?.data) {
      return { ok: true, data: cached.data, cached: true };
    }
  } catch {
    // Cache misses must not block the lookup.
  }

  const client = twilioClient();
  if (!client) {
    return {
      ok: false,
      error: {
        type: "config",
        message: "Phone verification is not configured.",
      },
    };
  }

  let lookup;
  try {
    lookup = await client.lookups.v2
      .phoneNumbers(phoneE164)
      .fetch({ fields: "line_type_intelligence" });
  } catch (error) {
    return {
      ok: false,
      error: {
        type: "api",
        status: error?.status ?? null,
        message: "Unable to verify this phone number right now.",
        cause: error,
      },
    };
  }

  const result = {
    valid: lookup?.valid === true,
    lineType: lookup?.lineTypeIntelligence?.type ?? null,
    carrier: lookup?.lineTypeIntelligence?.carrierName ?? null,
  };

  try {
    await setWithExactTtl(key, interval, result);
  } catch {
    // Best-effort cache write.
  }

  return { ok: true, data: result, cached: false };
}

/** True when Lookup says this line can receive an automated claim call. */
export const isCallableLineType = (lineType) =>
  !lineType || !BLOCKED_LINE_TYPES.has(lineType);
