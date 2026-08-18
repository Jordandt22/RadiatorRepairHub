/**
 * Heuristics for admin email cleaner — flags emails that likely need review/removal.
 * Returns stable reason codes; UI maps them to labels.
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "yopmail.com",
  "trashmail.com",
  "10minutemail.com",
  "getnada.com",
  "emailondeck.com",
  "fakeinbox.com",
  "maildrop.cc",
]);

const PLACEHOLDER_LOCAL =
  /^(test|testing|asdf|qwerty|noreply|no-?reply|donotreply|do-?not-?reply|example|sample|temp|fake|xxx|abc|admin|info123|user|username|email|mail)$/i;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "by",
  "inc",
  "llc",
  "ltd",
  "co",
  "corp",
  "company",
  "auto",
  "automotive",
  "radiator",
  "repair",
  "service",
  "services",
  "shop",
]);

function tokenizeBusinessTitle(title) {
  if (!title || typeof title !== "string") return [];
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * @param {string|null|undefined} email
 * @param {string|null|undefined} businessTitle
 * @returns {string[]} reason codes
 */
export function getSuspiciousEmailReasons(email, businessTitle = "") {
  const reasons = [];
  if (email == null || typeof email !== "string") return reasons;

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return reasons;

  const at = trimmed.indexOf("@");
  if (at <= 0 || at === trimmed.length - 1) {
    reasons.push("invalid_format");
    return reasons;
  }

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  if (!local || !domain || !domain.includes(".")) {
    reasons.push("invalid_format");
    return reasons;
  }

  const digitsOnly = local.replace(/\D/g, "");
  const digitRatio = local.length ? digitsOnly.length / local.length : 0;
  if (digitsOnly.length >= 6 && digitRatio >= 0.7) {
    reasons.push("mostly_digits");
  }

  if (/\d{5,}/.test(local)) {
    reasons.push("long_digit_run");
  }

  const vowels = (local.match(/[aeiou]/gi) || []).length;
  const vowelRatio = local.length ? vowels / local.length : 0;
  if (
    local.length >= 12 &&
    !/[-_.]/.test(local) &&
    vowelRatio < 0.15 &&
    /[a-z]/i.test(local)
  ) {
    reasons.push("random_local");
  }

  if (PLACEHOLDER_LOCAL.test(local) || /^(test|asdf|qwer)/i.test(local)) {
    reasons.push("placeholder");
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    reasons.push("disposable_domain");
  }

  if (trimmed.includes("webleads")) {
    reasons.push("webleads");
  }

  if (trimmed.includes("formsubmission")) {
    reasons.push("formsubmission");
  }

  if (trimmed.includes("hello")) {
    reasons.push("hello");
  }

  if (trimmed.includes("web")) {
    reasons.push("web");
  }

  if (trimmed.includes("internet")) {
    reasons.push("internet");
  }

  if (trimmed.includes("privacy")) {
    reasons.push("privacy");
  }

  if (trimmed.includes("hi")) {
    reasons.push("hi");
  }

  if (trimmed.includes("hr")) {
    reasons.push("hr");
  }

  if (trimmed.includes("fontsize")) {
    reasons.push("fontsize");
  }

  if (trimmed.includes("guest")) {
    reasons.push("guest");
  }

  if (trimmed.includes("care")) {
    reasons.push("care");
  }

  if (trimmed.includes("work")) {
    reasons.push("work");
  }

  if (trimmed.includes("order")) {
    reasons.push("order");
  }

  if (trimmed.includes("manager")) {
    reasons.push("manager");
  }

  if (trimmed.includes("marketing")) {
    reasons.push("marketing");
  }

  const titleTokens = tokenizeBusinessTitle(businessTitle);
  if (titleTokens.length >= 2) {
    const localNormalized = local.replace(/[^a-z0-9]/gi, "");
    const matched = titleTokens.some((token) =>
      localNormalized.includes(token.replace(/[^a-z0-9]/gi, ""))
    );
    if (!matched && localNormalized.length >= 4) {
      // Only flag when another stronger signal exists or local looks generic.
      if (
        reasons.length > 0 ||
        digitRatio >= 0.4 ||
        PLACEHOLDER_LOCAL.test(local)
      ) {
        reasons.push("unrelated_to_business");
      }
    }
  }

  return [...new Set(reasons)];
}

export function isSuspiciousEmail(email, businessTitle = "") {
  return getSuspiciousEmailReasons(email, businessTitle).length > 0;
}

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
