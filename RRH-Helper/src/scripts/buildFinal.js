import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import slugify from "slugify";
import { formatBusiness } from "./format.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "raw");
const SUPABASE_DIR = path.join(ROOT, "supabase");

const INPUT_FILE = path.join(RAW_DIR, "start.json");

const FINAL_FIELDS = [
  "id",
  "title",
  "address",
  "neighborhood",
  "street",
  "country_code",
  "website",
  "phone",
  "phone_unformatted",
  "total_score",
  "permanently_closed",
  "temporarily_closed",
  "place_id",
  "fid",
  "cid",
  "reviews_count",
  "images_count",
  "image_categories",
  "scraped_at",
  "opening_hours",
  "additional_info",
  "url",
  "search_page_url",
  "search_string",
  "language",
  "rank",
  "is_advertisement",
  "image_url",
  "kgmid",
  "reviews_distribution",
  "latitude",
  "longitude",
  "mechanic",
  "restroom",
  "credit_cards",
  "debit_cards",
  "wheelchair_accessible",
  "onsite_services",
  "oil_change",
  "nfc_mobile_payments",
  "appointments_recommended",
  "description",
  "service_tags",
  "title_tag",
  "meta_description",
  "local_note",
  "opening_hours_specification",
  "keywords",
  "highlights",
  "slug",
  "booking_links",
  "owner_updates",
  "image_urls",
  "state_id",
  "city_id",
  "postal_code_id",
  "primary_category_id",
  "secondary_category_ids",
];

function pickFinalFields(biz) {
  const defaults = {
    website: "",
    reviews_distribution: "",
    image_categories: [],
    secondary_category_ids: [],
    opening_hours_specification: null,
    keywords: [],
    highlights: [],
    booking_links: [],
    owner_updates: [],
    image_urls: [],
  };

  return Object.fromEntries(
    FINAL_FIELDS.map((field) => [
      field,
      biz[field] ?? defaults[field] ?? null,
    ])
  );
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeRawJson(filename, data) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.writeFileSync(path.join(RAW_DIR, filename), JSON.stringify(data, null, 2));
}

function makeSlug(name) {
  return slugify(name, { lower: true, strict: true });
}

function normalizePostalCode(zip) {
  if (zip == null || zip === "") return null;
  const str = zip.toString().trim();
  const num = Number(str);
  return Number.isNaN(num) ? str : num;
}

function buildFinal() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const startData = loadJson(INPUT_FILE);
  const unenrichedCount = startData.filter((b) => !b.enriched?.description).length;
  if (unenrichedCount > 0) {
    console.warn(
      `⚠️ ${unenrichedCount} businesses have no enrichment. Run "npm run enrich" first.`
    );
  }

  const businesses = startData.map(formatBusiness);
  const states = loadJson(path.join(SUPABASE_DIR, "states.json"));
  const cities = loadJson(path.join(SUPABASE_DIR, "cities.json"));
  const postalCodes = loadJson(path.join(SUPABASE_DIR, "postal_codes.json"));
  const primaryCategories = loadJson(
    path.join(SUPABASE_DIR, "primary_categories.json")
  );
  const secondaryCategories = loadJson(
    path.join(SUPABASE_DIR, "secondary_categories.json")
  );
  const existingBusinesses = fs.existsSync(
    path.join(SUPABASE_DIR, "businesses.json")
  )
    ? loadJson(path.join(SUPABASE_DIR, "businesses.json"))
    : [];

  const existingPlaceIds = new Set(
    existingBusinesses.map((b) => b.place_id).filter(Boolean)
  );

  const stateMap = Object.fromEntries(
    states.map((s) => [s.name.toLowerCase(), s])
  );
  const stateCodeMap = Object.fromEntries(
    states.map((s) => [s.code.toLowerCase(), s])
  );

  const cityMap = {};
  cities.forEach((c) => {
    cityMap[`${c.name.toLowerCase()}|${c.state_id}`] = c;
  });

  const postalCodeMap = {};
  postalCodes.forEach((p) => {
    postalCodeMap[`${p.city_id}|${p.code.toString().toLowerCase()}`] = p;
  });

  const primaryMap = Object.fromEntries(
    primaryCategories.map((p) => [p.name.toLowerCase(), p])
  );
  const secondaryMap = Object.fromEntries(
    secondaryCategories.map((s) => [s.name.toLowerCase(), s])
  );

  const newCities = [];
  const newPrimaryCategories = [];
  const newSecondaryCategories = [];
  const newPostalCodes = [];
  const final = [];

  function resolveCity(name, stateId) {
    const key = `${name.trim().toLowerCase()}|${stateId}`;
    if (cityMap[key]) return cityMap[key];

    const city = {
      id: randomUUID(),
      name: name.trim(),
      state_id: stateId,
      slug: makeSlug(name),
    };

    cityMap[key] = city;
    newCities.push(city);
    return city;
  }

  function resolvePrimaryCategory(name) {
    if (!name) return null;

    const key = name.trim().toLowerCase();
    if (primaryMap[key]) return primaryMap[key];

    const category = {
      id: randomUUID(),
      name: name.trim(),
      slug: makeSlug(name),
    };

    primaryMap[key] = category;
    newPrimaryCategories.push(category);
    return category;
  }

  function resolveSecondaryCategory(name) {
    const key = name.trim().toLowerCase();
    if (secondaryMap[key]) return secondaryMap[key];

    const category = {
      id: randomUUID(),
      name: name.trim(),
      slug: makeSlug(name),
    };

    secondaryMap[key] = category;
    newSecondaryCategories.push(category);
    return category;
  }

  function resolvePostalCode(code, cityId) {
    if (!code || !cityId) return null;

    const normalized = normalizePostalCode(code);
    const key = `${cityId}|${normalized.toString().toLowerCase()}`;
    if (postalCodeMap[key]) return postalCodeMap[key];

    const postalCode = {
      id: randomUUID(),
      code: normalized,
      city_id: cityId,
    };

    postalCodeMap[key] = postalCode;
    newPostalCodes.push(postalCode);
    return postalCode;
  }

  for (const biz of businesses) {
    if (biz.place_id && existingPlaceIds.has(biz.place_id)) {
      console.warn(`⚠️ Skipping duplicate place_id: ${biz.title} (${biz.place_id})`);
      continue;
    }

    const stateVal = biz.state?.trim().toLowerCase();
    const state = stateMap[stateVal] || stateCodeMap[stateVal];
    if (!state) {
      console.warn(`⚠️ State not found for business: ${biz.title} (${biz.state})`);
      continue;
    }

    if (!biz.city?.trim()) {
      console.warn(`⚠️ City missing for business: ${biz.title}`);
      continue;
    }

    const city = resolveCity(biz.city, state.id);
    const postalCode = resolvePostalCode(biz.postal_code, city.id);
    const primaryCategory = resolvePrimaryCategory(biz.category_name);

    const secondaryCategoryIds = [];
    if (Array.isArray(biz.categories)) {
      for (const sec of biz.categories) {
        const secCategory = resolveSecondaryCategory(sec);
        if (!secondaryCategoryIds.includes(secCategory.id)) {
          secondaryCategoryIds.push(secCategory.id);
        }
      }
    }

    const id = randomUUID();
    const slug = `${makeSlug(biz.title)}-${id}`;

    final.push(
      pickFinalFields({
        ...biz,
        id,
        slug,
        state_id: state.id,
        city_id: city.id,
        postal_code_id: postalCode?.id || null,
        primary_category_id: primaryCategory?.id || null,
        secondary_category_ids: secondaryCategoryIds,
      })
    );
  }

  writeRawJson("final.json", final);
  writeRawJson("new_cities.json", newCities);
  writeRawJson("new_primary_categories.json", newPrimaryCategories);
  writeRawJson("new_secondary_categories.json", newSecondaryCategories);
  writeRawJson("new_postal_codes.json", newPostalCodes);

  console.log(`✅ Processed ${final.length} businesses → raw/final.json`);
  console.log(`   New cities: ${newCities.length}`);
  console.log(`   New primary categories: ${newPrimaryCategories.length}`);
  console.log(`   New secondary categories: ${newSecondaryCategories.length}`);
  console.log(`   New postal codes: ${newPostalCodes.length}`);
}

buildFinal();
