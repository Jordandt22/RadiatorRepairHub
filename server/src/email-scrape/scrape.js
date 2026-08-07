import {
  CONTACT_PATHS,
  EMAIL_REGEX,
  FETCH_TIMEOUT_MS,
  MAILTO_REGEX,
  MIN_BODY_LENGTH,
  PLATFORM_HOST_PATTERNS,
  TRACKING_PARAMS,
  USER_AGENT,
} from "./constants.js";
import { isJunkEmail } from "./emailFilters.js";
import { getSuspiciousEmailReasons } from "../lib/suspiciousEmail.js";

const HIGH_CONFIDENCE_SUSPICIOUS = new Set([
  "invalid_format",
  "mostly_digits",
  "long_digit_run",
  "disposable_domain",
]);

export function normalizeWebsite(website) {
  const trimmed = String(website || "").trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}

function stripTrackingParams(url) {
  const cleaned = new URL(url.href);
  for (const key of [...cleaned.searchParams.keys()]) {
    if (
      TRACKING_PARAMS.has(key.toLowerCase()) ||
      key.toLowerCase().startsWith("utm_")
    ) {
      cleaned.searchParams.delete(key);
    }
  }
  return cleaned;
}

export function hostMatchesPlatform(hostname) {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return PLATFORM_HOST_PATTERNS.some((re) => re.test(host));
}

export function buildPageUrls(websiteUrl) {
  const base = stripTrackingParams(websiteUrl);
  const origin = base.origin;
  const urls = [];
  const seen = new Set();

  const add = (href) => {
    try {
      const u = new URL(href);
      const key = u.href.replace(/\/$/, "").toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      urls.push(u.href);
    } catch {
      // skip invalid
    }
  };

  add(base.href);
  add(`${origin}/`);
  for (const p of CONTACT_PATHS) {
    add(`${origin}${p}`);
  }

  return urls;
}

/** Reject helper-junk plus high-confidence digit/disposable spam. */
export function isRejectedEmail(email, businessTitle = "") {
  if (isJunkEmail(email)) return true;
  const reasons = getSuspiciousEmailReasons(email, businessTitle);
  return reasons.some((code) => HIGH_CONFIDENCE_SUSPICIOUS.has(code));
}

function extractEmailsFromHtml(html, businessTitle = "") {
  const mailto = [];
  const body = [];

  let match;
  MAILTO_REGEX.lastIndex = 0;
  while ((match = MAILTO_REGEX.exec(html)) !== null) {
    const email = match[1].toLowerCase();
    if (!isRejectedEmail(email, businessTitle)) mailto.push(email);
  }

  EMAIL_REGEX.lastIndex = 0;
  while ((match = EMAIL_REGEX.exec(html)) !== null) {
    const email = match[0].toLowerCase();
    if (!isRejectedEmail(email, businessTitle)) body.push(email);
  }

  return { mailto: [...new Set(mailto)], body: [...new Set(body)] };
}

function siteDomain(websiteUrl) {
  return websiteUrl.hostname.replace(/^www\./i, "").toLowerCase();
}

export function pickBestEmail(candidates, websiteUrl) {
  if (!candidates.length) return null;

  const domain = siteDomain(websiteUrl);
  const domainMatch = candidates.find(
    (e) => e.endsWith(`@${domain}`) || e.includes(`.${domain}`)
  );
  if (domainMatch) return domainMatch;

  return candidates[0];
}

function looksBlocked(status, html) {
  if (status === 403 || status === 429 || status === 503) return true;
  if (!html) return false;
  const lower = html.slice(0, 5000).toLowerCase();
  return (
    lower.includes("cf-browser-verification") ||
    lower.includes("just a moment") ||
    lower.includes("attention required") ||
    lower.includes("access denied") ||
    (lower.includes("cloudflare") && lower.includes("challenge"))
  );
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await res.text();
    return { ok: res.ok, status: res.status, html, error: null };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      html: "",
      error: err.name === "AbortError" ? "timeout" : err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scrape a business website for a usable email.
 * @returns {{ ok: true, email: string, source_page: string, pages_scraped: string[] }
 *   | { ok: false, reason: string, pages_scraped: string[], error?: string }}
 */
export async function scrapeBusinessWebsite(websiteRaw, businessTitle = "") {
  const websiteUrl = normalizeWebsite(websiteRaw);

  if (!websiteUrl) {
    return {
      ok: false,
      reason: "invalid_url",
      pages_scraped: [],
      error: "invalid_url",
    };
  }

  if (hostMatchesPlatform(websiteUrl.hostname)) {
    return {
      ok: false,
      reason: "social_or_platform",
      pages_scraped: [],
    };
  }

  const pageUrls = buildPageUrls(websiteUrl);
  const pagesScraped = [];
  let anySuccess = false;
  let anyBlocked = false;
  let anyEmpty = false;
  let lastError = null;
  const mailtoAll = [];
  const bodyAll = [];
  let sourcePage = null;

  for (const pageUrl of pageUrls) {
    const result = await fetchPage(pageUrl);
    pagesScraped.push(pageUrl);

    if (result.error) {
      lastError = result.error;
      continue;
    }

    if (looksBlocked(result.status, result.html)) {
      anyBlocked = true;
      lastError = `blocked_${result.status || "challenge"}`;
      continue;
    }

    if (!result.ok) {
      lastError = `http_${result.status}`;
      continue;
    }

    if (!result.html || result.html.length < MIN_BODY_LENGTH) {
      anyEmpty = true;
      lastError = "empty_response";
      continue;
    }

    anySuccess = true;
    const { mailto, body } = extractEmailsFromHtml(result.html, businessTitle);
    mailtoAll.push(...mailto);
    bodyAll.push(...body);

    const pageCandidates = [...new Set([...mailto, ...body])];
    if (pageCandidates.length > 0 && !sourcePage) {
      sourcePage = pageUrl;
      const email = pickBestEmail(
        [...new Set([...mailtoAll, ...bodyAll])],
        websiteUrl
      );
      if (email) {
        return {
          ok: true,
          email,
          source_page: sourcePage,
          pages_scraped: pagesScraped,
        };
      }
    }
  }

  const allCandidates = [...new Set([...mailtoAll, ...bodyAll])];
  if (allCandidates.length > 0) {
    const email = pickBestEmail(allCandidates, websiteUrl);
    if (email) {
      return {
        ok: true,
        email,
        source_page: sourcePage || pagesScraped[0],
        pages_scraped: pagesScraped,
      };
    }
  }

  let reason = "no_email_found";
  if (!anySuccess) {
    if (anyBlocked) reason = "blocked";
    else if (anyEmpty) reason = "empty_response";
    else reason = "fetch_failed";
  }

  const out = {
    ok: false,
    reason,
    pages_scraped: pagesScraped,
  };
  if (lastError) out.error = lastError;
  return out;
}
