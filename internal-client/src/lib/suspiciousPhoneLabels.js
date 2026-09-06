/** Labels for suspicion_reasons returned by GET /admin/businesses/with-phones */
export const SUSPICIOUS_PHONE_REASON_LABELS = {
  empty: "Empty",
  invalid: "Invalid",
  filtered: "Filtered",
};

export function formatPhoneSuspicionReason(code) {
  return SUSPICIOUS_PHONE_REASON_LABELS[code] ?? code;
}
