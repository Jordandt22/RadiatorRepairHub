import fs from "fs";
import path from "path";
import { find } from "geo-tz";
import { FLOW_PATHS, ensureFlowDirs } from "../flowPaths.js";

ensureFlowDirs();

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

const inputPath = FLOW_PATHS.newJson;
const outputPath = FLOW_PATHS.filtered;

function isClosed(value) {
  return value === true || value === "true";
}

/**
 * Category substrings that indicate home / HVAC / plumbing radiators
 * (not auto radiator shops). Matched case-insensitively against
 * categoryName + categories.
 */
const CATEGORY_BLOCKLIST = [
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

function findBlockedCategoryMatch(item) {
  const text = buildCategoryText(item);
  if (!text.trim()) return null;

  for (const term of CATEGORY_BLOCKLIST) {
    if (text.includes(term.toLowerCase())) {
      return term;
    }
  }
  return null;
}

if (!fs.existsSync(inputPath)) {
  console.error(`new.json not found: ${inputPath}`);
  console.error("Add your scrape data to flow/raw/new.json, then run filter again.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const trimmed = data.map((item) =>
  Object.fromEntries(
    FIELDS_TO_KEEP.map((field) => [field, item[field] ?? null])
  )
);

function hasText(value) {
  return value != null && String(value).trim() !== "";
}

function hasValidLocation(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

const filtered = [];
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

  if (passesQuality && !isDuplicateInPayload) {
    if (placeId) seenPlaceIds.add(placeId);
    filtered.push({
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

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));

console.log(
  `Filtered ${filtered.length} of ${data.length} records → ${outputPath}`
);

if (removed.length > 0) {
  console.log(`\nRemoved ${removed.length} record(s):`);
  removed.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.title}\n   address: ${item.address}\n   postalCode: ${item.postalCode}\n   totalScore: ${item.totalScore}\n   reason: ${item.reason}`
    );
  });
}
