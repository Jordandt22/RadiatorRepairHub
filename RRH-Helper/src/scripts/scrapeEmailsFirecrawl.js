import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Firecrawl } from "firecrawl";
import { isJunkEmail } from "./emailFilters.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");
const EMAILS_DIR = path.join(SRC_ROOT, "emails");
const NEED_FIRECRAWL_FILE = path.join(EMAILS_DIR, "need-firecrawl.json");
const FIRECRAWL_DIR = path.join(EMAILS_DIR, "firecrawl");

// Edit these to run a slice of eligible need-firecrawl entries (1-based batch).
// e.g. LIMIT=100, BATCH=1 → items 0–99; BATCH=2 → items 100–199.
// Output: emails/firecrawl/batch-{BATCH}/emails.json
// Failures: emails/firecrawl/still-need.json (append across batches)
const LIMIT = 100;
const BATCH = 2;

const BATCH_DIR = path.join(FIRECRAWL_DIR, `batch-${BATCH}`);
const EMAILS_FILE = path.join(BATCH_DIR, "emails.json");
const STILL_NEED_FILE = path.join(FIRECRAWL_DIR, "still-need.json");

// Firecrawl plan limits
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_CONCURRENT = 2;

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

const SKIP_REASONS = new Set(["social_or_platform"]);

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;

const MAILTO_REGEX =
  /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

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

/**
 * Enforces Firecrawl rate limits: max N requests / 60s and max C concurrent.
 */
class FirecrawlGate {
  constructor({
    maxPerMinute = MAX_REQUESTS_PER_MINUTE,
    maxConcurrent = MAX_CONCURRENT,
  } = {}) {
    this.maxPerMinute = maxPerMinute;
    this.maxConcurrent = maxConcurrent;
    this.timestamps = [];
    this.active = 0;
    this.waiters = [];
    this.pumpTimer = null;
  }

  async acquire() {
    await new Promise((resolve) => {
      this.waiters.push(resolve);
      this.#pump();
    });
  }

  #pump() {
    if (this.pumpTimer) {
      clearTimeout(this.pumpTimer);
      this.pumpTimer = null;
    }

    while (this.waiters.length > 0 && this.active < this.maxConcurrent) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < 60_000);

      if (this.timestamps.length >= this.maxPerMinute) {
        const waitMs = Math.max(
          25,
          60_000 - (now - this.timestamps[0]) + 25
        );
        this.pumpTimer = setTimeout(() => this.#pump(), waitMs);
        return;
      }

      this.active++;
      this.timestamps.push(Date.now());
      const resolve = this.waiters.shift();
      resolve();
    }
  }

  release() {
    this.active = Math.max(0, this.active - 1);
    this.#pump();
  }

  async run(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

class AsyncMutex {
  constructor() {
    this._chain = Promise.resolve();
  }

  async run(fn) {
    let release;
    const next = new Promise((resolve) => {
      release = resolve;
    });
    const prev = this._chain;
    this._chain = this._chain.then(() => next);
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }
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

function extractEmailsFromText(text) {
  if (!text) return { mailto: [], body: [] };

  const mailto = [];
  const body = [];

  let match;
  MAILTO_REGEX.lastIndex = 0;
  while ((match = MAILTO_REGEX.exec(text)) !== null) {
    const email = match[1].toLowerCase();
    if (!isJunkEmail(email)) mailto.push(email);
  }

  EMAIL_REGEX.lastIndex = 0;
  while ((match = EMAIL_REGEX.exec(text)) !== null) {
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

function listFirecrawlEmailFiles() {
  if (!fs.existsSync(FIRECRAWL_DIR)) return [];

  return fs
    .readdirSync(FIRECRAWL_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^batch-\d+$/.test(d.name))
    .map((d) => path.join(FIRECRAWL_DIR, d.name, "emails.json"))
    .filter((file) => fs.existsSync(file));
}

function loadDoneSlugs(stillNeed) {
  const done = new Set(stillNeed.map((e) => e.slug).filter(Boolean));

  for (const file of listFirecrawlEmailFiles()) {
    const entries = loadJson(file, []);
    for (const e of entries) {
      if (e?.slug) done.add(e.slug);
    }
  }

  return done;
}

function createClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set in .env");
  }

  return new Firecrawl({
    apiKey,
    ...(process.env.FIRECRAWL_API_URL
      ? { apiUrl: process.env.FIRECRAWL_API_URL }
      : {}),
  });
}

async function scrapePage(client, gate, url) {
  try {
    const doc = await gate.run(() =>
      client.scrape(url, {
        formats: ["markdown", "html"],
        onlyMainContent: false,
        timeout: 30000,
        blockAds: true,
        proxy: "auto",
      })
    );

    const markdown = doc?.markdown || "";
    const html = doc?.html || doc?.rawHtml || "";
    const text = [html, markdown].filter(Boolean).join("\n");

    if (!text || text.length < 50) {
      return { ok: false, text: "", error: "empty_response" };
    }

    return { ok: true, text, error: null };
  } catch (err) {
    const message = err?.message || String(err);
    const lower = message.toLowerCase();
    if (
      lower.includes("403") ||
      lower.includes("429") ||
      lower.includes("blocked") ||
      lower.includes("challenge") ||
      lower.includes("rate limit")
    ) {
      return { ok: false, text: "", error: `blocked: ${message}` };
    }
    return { ok: false, text: "", error: message };
  }
}

async function scrapeBusiness(client, gate, entry) {
  const websiteRaw = entry.website;
  const websiteUrl = normalizeWebsite(websiteRaw);

  if (!websiteUrl) {
    return {
      type: "still-need",
      entry: {
        slug: entry.slug,
        website: websiteRaw || "",
        reason: "scrape_failed",
        pages_scraped: [],
        error: "invalid_url",
      },
    };
  }

  const pageUrls = buildPageUrls(websiteUrl);
  const pagesScraped = [];
  let anySuccess = false;
  let anyBlocked = false;
  let lastError = null;
  const mailtoAll = [];
  const bodyAll = [];
  let sourcePage = null;

  for (const pageUrl of pageUrls) {
    const result = await scrapePage(client, gate, pageUrl);
    pagesScraped.push(pageUrl);

    if (!result.ok) {
      lastError = result.error;
      if (result.error?.startsWith("blocked")) anyBlocked = true;
      continue;
    }

    anySuccess = true;
    const { mailto, body } = extractEmailsFromText(result.text);
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
            slug: entry.slug,
            website: websiteRaw,
            email,
            source_page: sourcePage,
            pages_scraped: pagesScraped,
            method: "firecrawl",
          },
        };
      }
    }
  }

  const allCandidates = [...new Set([...mailtoAll, ...bodyAll])];
  if (allCandidates.length > 0) {
    return {
      type: "email",
      entry: {
        slug: entry.slug,
        website: websiteRaw,
        email: pickBestEmail(allCandidates, websiteUrl),
        source_page: sourcePage || pagesScraped[0],
        pages_scraped: pagesScraped,
        method: "firecrawl",
      },
    };
  }

  let reason = "no_email_found";
  if (!anySuccess) {
    reason = anyBlocked ? "blocked" : "scrape_failed";
  }

  const failEntry = {
    slug: entry.slug,
    website: websiteRaw,
    reason,
    pages_scraped: pagesScraped,
  };
  if (lastError) failEntry.error = lastError;

  return { type: "still-need", entry: failEntry };
}

async function main() {
  if (!Number.isFinite(LIMIT) || LIMIT < 1 || !Number.isFinite(BATCH) || BATCH < 1) {
    throw new Error("LIMIT and BATCH must be integers >= 1");
  }

  if (!fs.existsSync(NEED_FIRECRAWL_FILE)) {
    throw new Error(`Need-firecrawl file not found: ${NEED_FIRECRAWL_FILE}`);
  }

  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.mkdirSync(FIRECRAWL_DIR, { recursive: true });

  const client = createClient();
  const gate = new FirecrawlGate({
    maxPerMinute: MAX_REQUESTS_PER_MINUTE,
    maxConcurrent: MAX_CONCURRENT,
  });
  const writeLock = new AsyncMutex();

  const needFirecrawl = loadJson(NEED_FIRECRAWL_FILE, []);
  const emails = loadJson(EMAILS_FILE, []);
  const stillNeed = loadJson(STILL_NEED_FILE, []);
  const doneSlugs = loadDoneSlugs(stillNeed);

  const eligible = needFirecrawl.filter(
    (e) =>
      e?.slug &&
      e?.website &&
      String(e.website).trim() &&
      !SKIP_REASONS.has(e.reason)
  );

  const start = (BATCH - 1) * LIMIT;
  const end = start + LIMIT;
  const batchSlice = eligible.slice(start, end);
  const pending = batchSlice.filter((e) => !doneSlugs.has(e.slug));
  const totalBatches = Math.ceil(eligible.length / LIMIT) || 1;

  console.log(
    `Emails → ${EMAILS_FILE}\n` +
      `Still-need → ${STILL_NEED_FILE} (${stillNeed.length} existing)\n` +
      `Rate limit → ${MAX_REQUESTS_PER_MINUTE}/min, ${MAX_CONCURRENT} concurrent\n` +
      `Eligible (non-social): ${eligible.length} | batch ${BATCH}/${totalBatches} ` +
      `(index ${start}–${Math.min(end, eligible.length) - 1}, size ${batchSlice.length}) | ` +
      `already done in batch: ${batchSlice.length - pending.length} | pending: ${pending.length}`
  );

  if (pending.length === 0) {
    console.log("Nothing to scrape.");
    return;
  }

  let found = 0;
  let routed = 0;
  let nextIndex = 0;

  async function processOne(entry, label) {
    try {
      const result = await scrapeBusiness(client, gate, entry);

      await writeLock.run(() => {
        if (result.type === "email") {
          emails.push(result.entry);
          found++;
          console.log(`✅ ${label} → ${result.entry.email}`);
        } else {
          stillNeed.push(result.entry);
          routed++;
          console.log(`➡️  ${label} → still-need (${result.entry.reason})`);
        }
        saveJson(EMAILS_FILE, emails);
        saveJson(STILL_NEED_FILE, stillNeed);
      });
    } catch (err) {
      await writeLock.run(() => {
        stillNeed.push({
          slug: entry.slug,
          website: entry.website || "",
          reason: "scrape_failed",
          pages_scraped: [],
          error: err.message,
        });
        routed++;
        console.error(`❌ ${label}: ${err.message}`);
        saveJson(EMAILS_FILE, emails);
        saveJson(STILL_NEED_FILE, stillNeed);
      });
    }
  }

  // Run up to MAX_CONCURRENT businesses at once; page scrapes share the same gate.
  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENT, pending.length) },
    async () => {
      while (true) {
        const i = nextIndex++;
        if (i >= pending.length) break;
        const entry = pending[i];
        const label = `[${i + 1}/${pending.length}] ${entry.slug}`;
        await processOne(entry, label);
      }
    }
  );

  await Promise.all(workers);

  console.log(
    `\nDone. Emails found: ${found} | still-need: ${routed} | ` +
      `totals → emails.json: ${emails.length}, still-need.json: ${stillNeed.length}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
