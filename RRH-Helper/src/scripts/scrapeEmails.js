import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isJunkEmail } from "./emailFilters.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");

const BUSINESSES_FILE = path.join(SRC_ROOT, "supabase", "businesses.json");
const EMAILS_DIR = path.join(SRC_ROOT, "emails");

// Edit these to run a slice of businesses-with-website (1-based batch).
// e.g. LIMIT=100, BATCH=1 → items 0–99; BATCH=2 → items 100–199.
// emails → emails/batch-{BATCH}/emails.json
// need-firecrawl → emails/need-firecrawl.json (shared, append across batches)
const LIMIT = 100;
const BATCH = 20; // ! Finished Batch 20

const BATCH_DIR = path.join(EMAILS_DIR, `batch-${BATCH}`);
const EMAILS_FILE = path.join(BATCH_DIR, "emails.json");
const NEED_FIRECRAWL_FILE = path.join(EMAILS_DIR, "need-firecrawl.json");

const FETCH_TIMEOUT_MS = 10_000;
const DELAY_MIN_MS = 400;
const DELAY_MAX_MS = 600;
const MIN_BODY_LENGTH = 200;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us"];

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "ao_auto_show",
  "ao_client_key",
  "cmp",
  "stnum",
]);

const PLATFORM_HOST_PATTERNS = [
  /facebook\.com$/i,
  /fb\.com$/i,
  /instagram\.com$/i,
  /sites\.google\.com$/i,
  /maps\.app\.goo\.gl$/i,
  /goo\.gl$/i,
  /linktr\.ee$/i,
  /yelp\.com$/i,
  /twitter\.com$/i,
  /x\.com$/i,
  /linkedin\.com$/i,
  /tiktok\.com$/i,
  /youtube\.com$/i,
  /youtu\.be$/i,
];

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;

const MAILTO_REGEX = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return (
    DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1))
  );
}

function normalizeWebsite(website) {
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

function hostMatchesPlatform(hostname) {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return PLATFORM_HOST_PATTERNS.some((re) => re.test(host));
}

function buildPageUrls(websiteUrl) {
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

function extractEmailsFromHtml(html) {
  const mailto = [];
  const body = [];

  let match;
  MAILTO_REGEX.lastIndex = 0;
  while ((match = MAILTO_REGEX.exec(html)) !== null) {
    const email = match[1].toLowerCase();
    if (!isJunkEmail(email)) mailto.push(email);
  }

  EMAIL_REGEX.lastIndex = 0;
  while ((match = EMAIL_REGEX.exec(html)) !== null) {
    const email = match[0].toLowerCase();
    if (!isJunkEmail(email)) body.push(email);
  }

  return { mailto: [...new Set(mailto)], body: [...new Set(body)] };
}

function siteDomain(websiteUrl) {
  return websiteUrl.hostname.replace(/^www\./i, "").toLowerCase();
}

function pickBestEmail(candidates, websiteUrl) {
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

async function scrapeBusiness(business) {
  const websiteRaw = business.website;
  const websiteUrl = normalizeWebsite(websiteRaw);

  if (!websiteUrl) {
    return {
      type: "need-firecrawl",
      entry: {
        slug: business.slug,
        website: websiteRaw,
        reason: "fetch_failed",
        pages_scraped: [],
        error: "invalid_url",
      },
    };
  }

  if (hostMatchesPlatform(websiteUrl.hostname)) {
    return {
      type: "need-firecrawl",
      entry: {
        slug: business.slug,
        website: websiteRaw,
        reason: "social_or_platform",
        pages_scraped: [],
      },
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
    await sleep(randomDelay());
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
    const { mailto, body } = extractEmailsFromHtml(result.html);
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
          type: "email",
          entry: {
            slug: business.slug,
            website: websiteRaw,
            email,
            source_page: sourcePage,
            pages_scraped: pagesScraped,
          },
        };
      }
    }
  }

  const allCandidates = [
    ...new Set([...mailtoAll, ...bodyAll]),
  ];
  if (allCandidates.length > 0) {
    return {
      type: "email",
      entry: {
        slug: business.slug,
        website: websiteRaw,
        email: pickBestEmail(allCandidates, websiteUrl),
        source_page: sourcePage || pagesScraped[0],
        pages_scraped: pagesScraped,
      },
    };
  }

  let reason = "no_email_found";
  if (!anySuccess) {
    if (anyBlocked) reason = "blocked";
    else if (anyEmpty) reason = "empty_response";
    else reason = "fetch_failed";
  } else if (anyBlocked && !anySuccess) {
    reason = "blocked";
  }

  const entry = {
    slug: business.slug,
    website: websiteRaw,
    reason,
    pages_scraped: pagesScraped,
  };
  if (lastError) entry.error = lastError;

  return { type: "need-firecrawl", entry };
}

async function main() {
  if (!fs.existsSync(BUSINESSES_FILE)) {
    throw new Error(`Businesses file not found: ${BUSINESSES_FILE}`);
  }

  if (!Number.isFinite(LIMIT) || LIMIT < 1 || !Number.isFinite(BATCH) || BATCH < 1) {
    throw new Error("LIMIT and BATCH must be integers >= 1");
  }

  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.mkdirSync(EMAILS_DIR, { recursive: true });

  const businesses = loadJson(BUSINESSES_FILE, []);
  const emails = loadJson(EMAILS_FILE, []);
  const needFirecrawl = loadJson(NEED_FIRECRAWL_FILE, []);

  const doneSlugs = new Set([
    ...emails.map((e) => e.slug).filter(Boolean),
    ...needFirecrawl.map((e) => e.slug).filter(Boolean),
  ]);

  const withWebsite = businesses.filter(
    (b) => b.website && String(b.website).trim() && b.slug
  );

  const start = (BATCH - 1) * LIMIT;
  const end = start + LIMIT;
  const batchSlice = withWebsite.slice(start, end);
  const pending = batchSlice.filter((b) => !doneSlugs.has(b.slug));
  const totalBatches = Math.ceil(withWebsite.length / LIMIT) || 1;

  console.log(
    `Emails → ${EMAILS_FILE}\n` +
    `Need-firecrawl → ${NEED_FIRECRAWL_FILE} (${needFirecrawl.length} existing)\n` +
    `Businesses with website: ${withWebsite.length} | batch ${BATCH}/${totalBatches} (index ${start}–${Math.min(end, withWebsite.length) - 1}, size ${batchSlice.length}) | already done in batch: ${batchSlice.length - pending.length} | pending: ${pending.length}`
  );

  if (pending.length === 0) {
    console.log("Nothing to scrape.");
    return;
  }

  let found = 0;
  let routed = 0;

  for (let i = 0; i < pending.length; i++) {
    const business = pending[i];
    const label = `[${i + 1}/${pending.length}] ${business.slug}`;

    try {
      const result = await scrapeBusiness(business);

      if (result.type === "email") {
        emails.push(result.entry);
        found++;
        console.log(`✅ ${label} → ${result.entry.email}`);
      } else {
        needFirecrawl.push(result.entry);
        routed++;
        console.log(
          `➡️  ${label} → need-firecrawl (${result.entry.reason})`
        );
      }
    } catch (err) {
      needFirecrawl.push({
        slug: business.slug,
        website: business.website,
        reason: "fetch_failed",
        pages_scraped: [],
        error: err.message,
      });
      routed++;
      console.error(`❌ ${label}: ${err.message}`);
    }

    saveJson(EMAILS_FILE, emails);
    saveJson(NEED_FIRECRAWL_FILE, needFirecrawl);
  }

  console.log(
    `\nDone. Emails found: ${found} | need-firecrawl: ${routed} | totals → emails.json: ${emails.length}, need-firecrawl.json: ${needFirecrawl.length}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
