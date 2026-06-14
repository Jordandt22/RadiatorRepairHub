import fs from "fs";
import path from "path";
import { FLOW_PATHS, ensureFlowDirs } from "../flowPaths.js";

ensureFlowDirs();

const FIELDS_TO_KEEP = [
  "title",
  "price",
  "categoryName",
  "address",
  "neighborhood",
  "street",
  "city",
  "postalCode",
  "state",
  "countryCode",
  "website",
  "phone",
  "phoneUnformatted",
  "location",
  "totalScore",
  "permanentlyClosed",
  "temporarilyClosed",
  "placeId",
  "categories",
  "fid",
  "cid",
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
  "rank",
  "isAdvertisement",
  "imageUrl",
  "kgmid",
  "enriched",
  "additionalOpeningHours",
  "plusCode",
  "reviewsDistribution",
];

const inputPath = FLOW_PATHS.newJson;
const outputPath = FLOW_PATHS.filtered;

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

const filtered = [];
const removed = [];

for (const item of trimmed) {
  const hasAddress = item.address && String(item.address).trim() !== "";
  const hasPostalCode =
    item.postalCode != null && String(item.postalCode).trim() !== "";
  const hasMinScore = item.totalScore == null || item.totalScore >= 3;

  if (hasAddress && hasPostalCode && hasMinScore) {
    filtered.push(item);
    continue;
  }

  const reasons = [];
  if (!hasAddress) reasons.push("missing address");
  if (!hasPostalCode) reasons.push("missing postal code");
  if (!hasMinScore) reasons.push(`totalScore below 3 (${item.totalScore})`);

  removed.push({
    title: item.title,
    address: item.address ?? null,
    postalCode: item.postalCode ?? null,
    totalScore: item.totalScore ?? null,
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
