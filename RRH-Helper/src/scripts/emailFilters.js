const JUNK_LOCAL_PARTS = new Set([
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
  "mailer-daemon",
  "postmaster",
  "bootstrap",
  "bootstrap-icons",
  "intl-segmenter",
  "maplibre-gl",
]);

const JUNK_DOMAINS = new Set([
  "example.com",
  "example.org",
  "test.com",
  "email.com",
  "domain.com",
  "address.com",
  "mysite.com",
  "mple.com",
  "sentry.io",
  "wixpress.com",
  "wix.com",
  "squarespace.com",
  "godaddy.com",
  "schema.org",
  "w3.org",
  "googleapis.com",
  "gstatic.com",
  "google.com",
  "googlemail.com",
  "cloudflare.com",
  "jquery.com",
  "github.com",
  "gravatar.com",
  "indiantypefoundry.com",
  "latofonts.com",
  "mhtml.blink",
  "paradox.ai",
  "yocale.com",
]);

const JUNK_DOMAIN_SUFFIXES = [
  ".sentry.io",
  ".ingest.sentry.io",
  ".wixpress.com",
  ".googleapis.com",
  ".gstatic.com",
  ".blink",
];

/** Directory / map sites that publish listing emails (substring match on domain). */
const DIRECTORY_DOMAIN_TOKENS = [
  "locmaps",
  "uscmaps",
  "pixelmotion",
  "pixelspread",
  "webador",
  "bfrc",
  "bbemail",
  "sansoxygen",
  "wylerleads",
];

const PLACEHOLDER_EMAILS = new Set([
  "info@mysite.com",
  "ex@mple.com",
  "email@address.com",
  "name@email.com",
  "user@domain.com",
  "your@email.com",
  "someone@example.com",
  "test@test.com",
  "smshelp@paradox.ai",
  "name@hotmail.com",
  "office@legit.com",
  "johnsmith@gmail.com",
  "news@drivenbrands.com",
  "leads@loho.wylerleads.com",
  "maplibre-gl@4.x",
  "john@advancedlocal.com",
  "websitecontact@maah.global",
  "hosting@treadpartners.com",
  "wweeiihhuuaanngg@gmail.com",
]);

const STRICT_EMAIL_RE =
  /^[a-z0-9._+-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * Decode URL-encoding / trim junk so "%20name@domain.com" → "name@domain.com".
 * Returns null if the result is not a usable email.
 */
export function normalizeScrapedEmail(raw) {
  if (!raw || typeof raw !== "string") return null;

  let value = raw.trim();
  if (!value) return null;

  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(value.replace(/\+/g, "%20"));
      if (decoded === value) break;
      value = decoded;
    } catch {
      value = value.replace(/%[0-9a-f]{2}/gi, (seq) => {
        try {
          return decodeURIComponent(seq);
        } catch {
          return "";
        }
      });
      break;
    }
  }

  value = value.trim().toLowerCase();
  if (!value) return null;

  if (value.includes("%")) {
    value = value
      .replace(/%[0-9a-f]{2}/gi, "")
      .replace(/%/g, "")
      .trim();
  }

  if (!value || /\s/.test(value)) return null;
  if (!STRICT_EMAIL_RE.test(value)) return null;
  if (value.length > 254) return null;

  return value;
}

/** @returns {string|null} reason if junk, otherwise null */
export function getJunkReason(email) {
  if (!email || typeof email !== "string") return "invalid";

  const lower = email.trim().toLowerCase();
  const [local, domain] = lower.split("@");
  if (!local || !domain) return "invalid";
  if (local.length > 64 || domain.length > 255) return "invalid";
  if (/%|\s/.test(lower)) return "invalid";

  if (PLACEHOLDER_EMAILS.has(lower)) return "placeholder";
  if (JUNK_LOCAL_PARTS.has(local)) return "junk_local";

  if (lower.includes("accessibility")) return "accessibility_vendor";
  if (
    lower.includes("testaccount") ||
    lower.includes("webmaster") ||
    lower.includes("your.email")
  ) {
    return "junk_local";
  }

  // Chrome/Blink MHTML frame IDs: frame-<hex>@mhtml.blink
  if (domain === "mhtml.blink" || domain.endsWith(".blink")) {
    return "browser_artifact";
  }
  if (/^frame-[0-9a-f]{8,}$/i.test(local)) {
    return "browser_artifact";
  }

  if (DIRECTORY_DOMAIN_TOKENS.some((token) => domain.includes(token))) {
    return "directory_site";
  }

  if (JUNK_DOMAINS.has(domain)) {
    if (
      domain === "mysite.com" ||
      domain === "mple.com" ||
      domain === "address.com" ||
      domain === "example.com" ||
      domain === "example.org" ||
      domain === "email.com" ||
      domain === "domain.com"
    ) {
      return "placeholder";
    }
    if (domain === "sentry.io") return "sentry";
    if (
      domain === "indiantypefoundry.com" ||
      domain === "latofonts.com"
    ) {
      return "font_cdn";
    }
    if (domain === "mhtml.blink") return "browser_artifact";
    return "junk_domain";
  }

  if (domain === "sentry.io" || domain.endsWith(".sentry.io")) {
    return "sentry";
  }
  for (const suffix of JUNK_DOMAIN_SUFFIXES) {
    if (domain.endsWith(suffix) || domain === suffix.slice(1)) {
      if (suffix.includes("sentry")) return "sentry";
      if (suffix.includes("blink")) return "browser_artifact";
      return "junk_domain";
    }
  }

  // npm/CDN version strings mistaken for emails: bootstrap@5.3.3, maplibre-gl@4.x
  const labels = domain.split(".");
  const tld = labels[labels.length - 1];
  if (/^\d+$/.test(tld)) return "version_string";
  if (/^\d+(\.\d+)+$/.test(domain)) return "version_string";
  if (/^\d+\.x$/i.test(domain)) return "version_string";
  if (/^[a-z0-9._-]+@\d+(\.\d+)*\.?x?$/i.test(lower)) return "version_string";

  if (
    domain.endsWith(".png") ||
    domain.endsWith(".jpg") ||
    domain.endsWith(".jpeg") ||
    domain.endsWith(".gif") ||
    domain.endsWith(".svg") ||
    domain.endsWith(".webp") ||
    domain.endsWith(".css") ||
    domain.endsWith(".js")
  ) {
    return "file_extension";
  }
  if (/\.(png|jpe?g|gif|svg|webp|css|js)@/i.test(lower)) return "file_extension";
  if (local.includes("..") || domain.includes("..")) return "invalid";

  if (
    domain.includes("typefoundry") ||
    domain.includes("latofonts") ||
    /(^|\.)fonts?\./i.test(domain)
  ) {
    return "font_cdn";
  }

  return null;
}

export function isJunkEmail(email) {
  return getJunkReason(email) != null;
}
