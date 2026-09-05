import { getClaimCallWindowStatus } from "./claimCallWindow.js";

/**
 * Phone helpers for claim verification calls. Listing phones come from ingest
 * in mixed display formats, so everything is normalized to NANP E.164 before
 * filtering, caching, or dialing.
 */

/** Toll-free and premium NANP area codes we never place claim calls to. */
const BLOCKED_AREA_CODES = new Set([
  "800",
  "833",
  "844",
  "855",
  "866",
  "877",
  "888",
  "889",
  "900",
  "976",
]);

export const CLAIM_PHONE_BLOCK_REASONS = Object.freeze({
  NO_PHONE: "no_phone",
  INVALID_PHONE: "invalid_phone",
  FILTERED_PHONE: "filtered_phone",
  SHARED_PHONE: "shared_phone",
  NO_TIMEZONE: "no_timezone",
  OUTSIDE_HOURS: "outside_hours",
});

/** Digits only, dropping a leading US country code. */
export const getPhoneDigits = (phone) => {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
};

/** NANP E.164 (+1XXXXXXXXXX) or null when the number is not dialable. */
export const normalizeClaimPhone = (phone) => {
  const digits = getPhoneDigits(phone);
  if (!digits || digits.length !== 10) return null;

  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);

  // Area code and exchange must start with 2-9 in the NANP.
  if (!/^[2-9]\d{2}$/.test(areaCode)) return null;
  if (!/^[2-9]\d{2}$/.test(exchange)) return null;

  return `+1${digits}`;
};

/** Toll-free, premium, and N11-style numbers cannot be used for claiming. */
export const isBlockedClaimPhone = (phoneE164) => {
  const digits = getPhoneDigits(phoneE164);
  if (!digits || digits.length !== 10) return true;
  return BLOCKED_AREA_CODES.has(digits.slice(0, 3));
};

/** (555) 123-4567 style display for a normalized number. */
export const formatClaimPhoneDisplay = (phone) => {
  const digits = getPhoneDigits(phone);
  if (!digits || digits.length !== 10) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/** (555) ***-4567 so we never echo a full listing phone back to the client. */
export const maskClaimPhone = (phone) => {
  const digits = getPhoneDigits(phone);
  if (!digits || digits.length !== 10) return null;
  return `(${digits.slice(0, 3)}) ***-${digits.slice(6)}`;
};

/**
 * Local-format checks that do not cost a Twilio Lookup request.
 * Returns a block reason or null when the number passes.
 */
export const getLocalClaimPhoneBlockReason = (phone) => {
  const hasPhone = typeof phone === "string" ? Boolean(phone.trim()) : Boolean(phone);
  if (!hasPhone) return CLAIM_PHONE_BLOCK_REASONS.NO_PHONE;

  const normalized = normalizeClaimPhone(phone);
  if (!normalized) return CLAIM_PHONE_BLOCK_REASONS.INVALID_PHONE;
  if (isBlockedClaimPhone(normalized)) return CLAIM_PHONE_BLOCK_REASONS.FILTERED_PHONE;

  return null;
};

/**
 * Everything we can decide without billing a Twilio Lookup request. Lookup
 * runs only when a claim is actually started.
 * @returns {{ eligible: boolean, reason: string|null, phoneE164: string|null }}
 */
export const getPhoneClaimEligibility = ({
  phone,
  hours,
  timezone,
  isPhoneShared = false,
} = {}) => {
  const localReason = getLocalClaimPhoneBlockReason(phone);
  if (localReason) {
    return { eligible: false, reason: localReason, phoneE164: null };
  }

  const phoneE164 = normalizeClaimPhone(phone);

  if (isPhoneShared) {
    return {
      eligible: false,
      reason: CLAIM_PHONE_BLOCK_REASONS.SHARED_PHONE,
      phoneE164,
    };
  }

  // Dev: skip shop/call-hour gates so voice claims can be tested anytime.
  if (process.env.NODE_ENV === "development") {
    return { eligible: true, reason: null, phoneE164 };
  }

  const window = getClaimCallWindowStatus(hours, timezone);
  if (!window.allowed) {
    return {
      eligible: false,
      reason:
        window.reason === "no_timezone"
          ? CLAIM_PHONE_BLOCK_REASONS.NO_TIMEZONE
          : CLAIM_PHONE_BLOCK_REASONS.OUTSIDE_HOURS,
      phoneE164,
    };
  }

  return { eligible: true, reason: null, phoneE164 };
};

/** In development every claim call goes to the test recipient phone. */
export const resolveClaimCallTarget = (listingPhoneE164) => {
  if (process.env.NODE_ENV !== "development") return listingPhoneE164;

  const testPhone = normalizeClaimPhone(process.env.TEST_RECIPIENT_PHONE);
  return testPhone ?? null;
};
