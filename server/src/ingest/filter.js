import { find } from "geo-tz";

const FIELDS_TO_KEEP = [
  "title",
  "price",
  "categoryName",
  "address",
  "city",
  "postalCode",
  "state",
  "website",
  "phone",
  "phoneUnformatted",
  "location",
  "totalScore",
  "permanentlyClosed",
  "temporarilyClosed",
  "placeId",
  "categories",
  "reviewsCount",
  "imagesCount",
  "imageCategories",
  "scrapedAt",
  "openingHours",
  "additionalInfo",
  "url",
  "searchPageUrl",
  "searchString",
  "language",
  "isAdvertisement",
  "imageUrl",
  "enriched",
  "additionalOpeningHours",
];

function resolveTimezone(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  try {
    const zones = find(lat, lng);
    return zones[0] ?? null;
  } catch {
    return null;
  }
}

function isClosed(value) {
  return value === true || value === "true";
}

/**
 * Category substrings that indicate home / HVAC / plumbing radiators
 * (not auto radiator shops). Matched case-insensitively against
 * categoryName + categories.
 */
export const CATEGORY_BLOCKLIST = [
  "hvac",
  "heating contractor",
  "furnace",
  "boiler",
  "plumber",
  "plumbing",
  "hydronic",
  "home heating",
  "residential heating",
  "radiator installation",
  "water heater",
];

function buildCategoryText(item) {
  const parts = [];
  if (item.categoryName) parts.push(String(item.categoryName));
  if (Array.isArray(item.categories)) {
    for (const category of item.categories) {
      if (category) parts.push(String(category));
    }
  }
  return parts.join(" ").toLowerCase();
}

/**
 * @returns {string|null} matched block term, or null if allowed
 */
export function findBlockedCategoryMatch(item) {
  const text = buildCategoryText(item);
  if (!text.trim()) return null;

  for (const term of CATEGORY_BLOCKLIST) {
    if (text.includes(term.toLowerCase())) {
      return term;
    }
  }
  return null;
}

function hasText(value) {
  return value != null && String(value).trim() !== "";
}

function hasValidLocation(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

/**
 * Filter and clean scrape JSON.
 * @param {unknown[]} data
 * @param {{ existingPlaceIds?: Set<string> }} [options]
 * @returns {{ kept: object[], removed: object[] }}
 */
export function filterBusinesses(data, options = {}) {
  if (!Array.isArray(data)) {
    throw new Error("Ingest payload must be a JSON array");
  }

  const existingPlaceIds =
    options.existingPlaceIds instanceof Set
      ? options.existingPlaceIds
      : new Set(options.existingPlaceIds || []);

  const trimmed = data.map((item) =>
    Object.fromEntries(
      FIELDS_TO_KEEP.map((field) => [field, item?.[field] ?? null])
    )
  );

  const kept = [];
  const removed = [];
  const seenPlaceIds = new Set();

  for (const item of trimmed) {
    const hasTitle = hasText(item.title);
    const hasAddress = hasText(item.address);
    const hasCity = hasText(item.city);
    const hasState = hasText(item.state);
    const hasPhone = hasText(item.phone) || hasText(item.phoneUnformatted);
    const hasCategory = hasText(item.categoryName);
    const hasPlaceId = hasText(item.placeId);
    const hasLocation = hasValidLocation(item.location);
    const timezone = hasLocation ? resolveTimezone(item.location) : null;
    const hasTimezone = hasText(timezone);
    const hasScore = item.totalScore != null && item.totalScore !== "";
    const hasMinScore = hasScore && Number(item.totalScore) >= 3;
    const isPermanentlyClosed = isClosed(item.permanentlyClosed);
    const isTemporarilyClosed = isClosed(item.temporarilyClosed);
    const isOpen = !isPermanentlyClosed && !isTemporarilyClosed;
    const blockedCategory = findBlockedCategoryMatch(item);
    const isAutoRelevant = !blockedCategory;

    const placeId = hasPlaceId ? String(item.placeId).trim() : null;
    const isDuplicateInPayload = placeId != null && seenPlaceIds.has(placeId);
    const isDuplicateInDb =
      placeId != null && existingPlaceIds.has(placeId);

    // Require scrape fields that map to NOT NULL businesses columns / insert FKs.
    // Optional in DB (postal_code_id, website, url, image_url, email, scraped_at): not required.
    const passesRequired =
      hasTitle &&
      hasAddress &&
      hasCity &&
      hasState &&
      hasPhone &&
      hasCategory &&
      hasPlaceId &&
      hasLocation &&
      hasTimezone &&
      hasScore &&
      hasMinScore;

    const passesQuality = passesRequired && isOpen && isAutoRelevant;

    if (passesQuality && !isDuplicateInPayload && !isDuplicateInDb) {
      if (placeId) seenPlaceIds.add(placeId);
      kept.push({
        ...item,
        timezone,
      });
      continue;
    }

    const reasons = [];
    if (!hasTitle) reasons.push("missing title");
    if (!hasAddress) reasons.push("missing address");
    if (!hasCity) reasons.push("missing city");
    if (!hasState) reasons.push("missing state");
    if (!hasPhone) reasons.push("missing phone");
    if (!hasCategory) reasons.push("missing category");
    if (!hasPlaceId) reasons.push("missing place id");
    if (!hasLocation) reasons.push("missing location");
    else if (!hasTimezone) reasons.push("missing timezone");
    if (!hasScore) reasons.push("missing total score");
    else if (!hasMinScore) {
      reasons.push(`totalScore below 3 (${item.totalScore})`);
    }
    if (isPermanentlyClosed) reasons.push("permanently closed");
    if (isTemporarilyClosed) reasons.push("temporarily closed");
    if (blockedCategory) {
      reasons.push(`blocked category (${blockedCategory})`);
    }
    if (passesQuality && isDuplicateInPayload) {
      reasons.push("duplicate place id");
    } else if (passesQuality && isDuplicateInDb) {
      reasons.push("duplicate place id (already exists)");
      if (placeId) seenPlaceIds.add(placeId);
    }

    removed.push({
      title: item.title,
      placeId: item.placeId ?? null,
      address: item.address ?? null,
      postalCode: item.postalCode ?? null,
      totalScore: item.totalScore ?? null,
      permanentlyClosed: item.permanentlyClosed ?? null,
      temporarilyClosed: item.temporarilyClosed ?? null,
      categoryName: item.categoryName ?? null,
      reason: reasons.join(", "),
    });
  }

  return { kept, removed };
}

export function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const INGEST_BATCH_SIZE = 20;
