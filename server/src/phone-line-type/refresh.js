import { normalizeClaimPhone } from "../lib/claimPhone.js";
import { lookupPhoneLineType } from "../twilio/lookup.js";
import {
  clearBusinessPhoneLineTypes,
  saveBusinessPhoneLineTypes,
} from "../supabase/supabase.functions.js";

export function phoneLineChanged(previousPhone, nextPhone) {
  return normalizeClaimPhone(previousPhone) !== normalizeClaimPhone(nextPhone);
}

/**
 * After a phone number change: store a successful lookup, including invalid
 * numbers. An API failure clears the stored type and leaves the row unchecked.
 */
export async function refreshPhoneLineType(businessId, phone) {
  const phoneE164 = normalizeClaimPhone(phone);
  if (!phoneE164) {
    return clearBusinessPhoneLineTypes([businessId]);
  }

  const lookup = await lookupPhoneLineType(phoneE164);
  if (!lookup.ok) {
    const cleared = await clearBusinessPhoneLineTypes([businessId]);
    return { data: cleared.data, error: lookup.error, lookupFailed: true };
  }

  return saveBusinessPhoneLineTypes([businessId], {
    lineType: lookup.data.lineType,
    carrier: lookup.data.carrier,
  });
}
