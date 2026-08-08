import { DELAY_MAX_MS, DELAY_MIN_MS } from "./constants.js";
import {
  getBusinessesByIds,
  incrementEmailScrapedAttempts,
  setBusinessEmail,
} from "./db.js";
import { scrapeBusinessWebsite } from "./scrape.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return (
    DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1))
  );
}

async function processBusiness(business) {
  const base = {
    business_id: business.id,
    title: business.title ?? null,
    slug: business.slug ?? null,
    website: business.website ?? null,
  };

  const existingEmail =
    typeof business.email === "string" ? business.email.trim() : "";
  if (existingEmail) {
    return {
      ...base,
      status: "skipped",
      reason: "already_has_email",
      email: existingEmail,
    };
  }

  if (business.email_status === "unable_to_find") {
    return {
      ...base,
      status: "skipped",
      reason: "unable_to_find",
    };
  }

  await incrementEmailScrapedAttempts(
    business.id,
    business.email_scraped_attempts ?? 0
  );

  try {
    const result = await scrapeBusinessWebsite(
      business.website,
      business.title ?? ""
    );

    if (result.ok && result.email) {
      await setBusinessEmail(business.id, result.email);
      return {
        ...base,
        status: "succeeded",
        email: result.email,
        source_page: result.source_page ?? null,
        pages_scraped: result.pages_scraped ?? [],
      };
    }

    const reason = result.reason || "no_email_found";
    const skipReasons = new Set([
      "social_or_platform",
      "invalid_url",
      "no_email_found",
    ]);
    const status = skipReasons.has(reason) ? "skipped" : "failed";

    return {
      ...base,
      status,
      reason,
      error: result.error ?? null,
      pages_scraped: result.pages_scraped ?? [],
    };
  } catch (err) {
    return {
      ...base,
      status: "failed",
      reason: "fetch_failed",
      error: err?.message || "Email scrape failed",
    };
  }
}

export async function processEmailScrapeBusinesses(businessIds) {
  const businesses = await getBusinessesByIds(businessIds);
  const result_payload = [];
  let succeeded_count = 0;
  let failed_count = 0;
  let skipped_count = 0;

  for (let i = 0; i < businesses.length; i += 1) {
    if (i > 0) {
      await sleep(randomDelay());
    }
    const outcome = await processBusiness(businesses[i]);
    result_payload.push(outcome);
    if (outcome.status === "succeeded") succeeded_count += 1;
    else if (outcome.status === "failed") failed_count += 1;
    else skipped_count += 1;
  }

  return {
    succeeded_count,
    failed_count,
    skipped_count,
    result_payload,
  };
}
