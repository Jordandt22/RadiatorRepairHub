/** Labels for suspicion_reasons returned by GET /admin/businesses/with-emails */
export const SUSPICIOUS_EMAIL_REASON_LABELS = {
  invalid_format: "Invalid format",
  mostly_digits: "Mostly digits",
  long_digit_run: "Long number run",
  random_local: "Random-looking",
  placeholder: "Placeholder",
  disposable_domain: "Disposable domain",
  unrelated_to_business: "Unrelated to name",
  webleads: "WebLeads lead-gen",
  formsubmission: "Form submission lead-gen",
  hello: "Generic hello address",
  web: "Generic web address",
  internet: "Generic internet address",
  privacy: "Privacy policy address",
  hi: "Generic hi address",
  hr: "HR department address",
  fontsize: "CSS/font artifact",
  guest: "Guest account address",
  care: "Customer care address",
  work: "Generic work address",
  order: "Orders department address",
  manager: "Manager department address",
  marketing: "Marketing department address",
};

export function formatSuspicionReason(code) {
  return SUSPICIOUS_EMAIL_REASON_LABELS[code] ?? code;
}
