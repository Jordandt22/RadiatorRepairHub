/** Labels for suspicion_reasons returned by GET /admin/businesses/with-emails */
export const SUSPICIOUS_EMAIL_REASON_LABELS = {
  invalid_format: "Invalid format",
  mostly_digits: "Mostly digits",
  long_digit_run: "Long number run",
  random_local: "Random-looking",
  placeholder: "Placeholder",
  disposable_domain: "Disposable domain",
  unrelated_to_business: "Unrelated to name",
};

export function formatSuspicionReason(code) {
  return SUSPICIOUS_EMAIL_REASON_LABELS[code] ?? code;
}
