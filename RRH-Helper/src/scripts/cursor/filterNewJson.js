import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const inputPath = path.join(__dirname, "../../raw/new.json");
const outputPath = path.join(__dirname, "../../raw/start.json");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

const trimmed = data.map((item) =>
  Object.fromEntries(
    FIELDS_TO_KEEP.map((field) => [field, item[field] ?? null])
  )
);

const filtered = trimmed.filter((item) => {
  const hasAddress = item.address && String(item.address).trim() !== "";
  const hasMinScore = item.totalScore == null || item.totalScore >= 3;
  return hasAddress && hasMinScore;
});

fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));

console.log(
  `Filtered ${filtered.length} of ${data.length} records → ${outputPath}`
);
