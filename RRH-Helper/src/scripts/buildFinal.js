import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import slugify from "slugify";
import { formatBusiness } from "./format.js";
import { FLOW_PATHS, ensureFlowDirs } from "./flowPaths.js";

ensureFlowDirs();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SUPABASE_DIR = path.join(ROOT, "supabase");

const INPUT_FILE = FLOW_PATHS.enriched;
const OUTPUT_FILE = FLOW_PATHS.final;

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
  "timezone",
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

function writeFlowJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function normalizeStateCode(stateCode) {
  return stateCode?.toString().toUpperCase();
}

function cityNaturalKey(slug, stateId, stateCode) {
  return `${slug}|${stateId}|${normalizeStateCode(stateCode)}`;
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
    throw new Error(
      `Enriched file not found: ${INPUT_FILE}. Run "npm run enrich" first.`
    );
  }

  const enrichedData = loadJson(INPUT_FILE);
  const unenrichedCount = enrichedData.filter((b) => {
    return !b?.enriched
  }).length;
  if (unenrichedCount > 0) {
    console.warn(
      `⚠️ ${unenrichedCount} businesses have no enrichment. Run "npm run enrich" first.`
    );
  }

  const businesses = enrichedData.map(formatBusiness);
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
  const stateIdToCode = Object.fromEntries(
    states.map((s) => [s.id, normalizeStateCode(s.code)])
  );

  const cityMap = {};
  cities.forEach((c) => {
    const stateCode = stateIdToCode[c.state_id];
    if (!stateCode) return;
    cityMap[cityNaturalKey(c.slug, c.state_id, stateCode)] = c;
  });

  const cityIdToSlug = Object.fromEntries(cities.map((c) => [c.id, c.slug]));
  const cityIdToMeta = {};
  cities.forEach((c) => {
    const stateCode = stateIdToCode[c.state_id];
    if (!stateCode) return;
    cityIdToMeta[c.id] = { slug: c.slug, stateId: c.state_id, stateCode };
  });

  const postalCodeMap = {};
  postalCodes.forEach((p) => {
    const meta = cityIdToMeta[p.city_id];
    if (!meta) return;
    postalCodeMap[
      `${meta.slug}|${meta.stateCode}|${p.code.toString().toLowerCase()}`
    ] = p;
  });

  const primaryMap = Object.fromEntries(
    primaryCategories.map((p) => [p.slug, p])
  );
  const secondaryMap = Object.fromEntries(
    secondaryCategories.map((s) => [s.slug, s])
  );

  const newCities = [];
  const newPrimaryCategories = [];
  const newSecondaryCategories = [];
  const newPostalCodes = [];
  const final = [];

  function resolveCity(name, state) {
    const slug = makeSlug(name);
    const stateCode = normalizeStateCode(state.code);
    const key = cityNaturalKey(slug, state.id, stateCode);
    if (cityMap[key]) return cityMap[key];

    const city = {
      id: randomUUID(),
      name: name.trim(),
      state_id: state.id,
      state_code: state.code,
      slug,
    };

    cityMap[key] = city;
    cityIdToSlug[city.id] = slug;
    cityIdToMeta[city.id] = { slug, stateId: state.id, stateCode };
    newCities.push(city);
    return city;
  }

  function resolvePrimaryCategory(name) {
    if (!name) return null;

    const slug = makeSlug(name);
    if (primaryMap[slug]) return primaryMap[slug];

    const category = {
      id: randomUUID(),
      name: name.trim(),
      slug,
    };

    primaryMap[slug] = category;
    newPrimaryCategories.push(category);
    return category;
  }

  function resolveSecondaryCategory(name) {
    const slug = makeSlug(name);
    if (secondaryMap[slug]) return secondaryMap[slug];

    const category = {
      id: randomUUID(),
      name: name.trim(),
      slug,
    };

    secondaryMap[slug] = category;
    newSecondaryCategories.push(category);
    return category;
  }

  function resolvePostalCode(code, city, state) {
    if (!code || !city) return null;

    const normalized = normalizePostalCode(code);
    const key = `${city.slug}|${normalizeStateCode(state.code)}|${normalized
      .toString()
      .toLowerCase()}`;
    if (postalCodeMap[key]) return postalCodeMap[key];

    const postalCode = {
      id: randomUUID(),
      code: normalized,
      city_id: city.id,
      city_slug: city.slug,
      state_code: state.code,
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

    const city = resolveCity(biz.city, state);
    const postalCode = resolvePostalCode(biz.postal_code, city, state);
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

  writeFlowJson(OUTPUT_FILE, final);
  writeFlowJson(FLOW_PATHS.newCities, newCities);
  writeFlowJson(FLOW_PATHS.newPrimaryCategories, newPrimaryCategories);
  writeFlowJson(FLOW_PATHS.newSecondaryCategories, newSecondaryCategories);
  writeFlowJson(FLOW_PATHS.newPostalCodes, newPostalCodes);

  console.log(
    `📄 Created final.json from enrich/enriched.json (${final.length} businesses)`
  );
  console.log(`   New cities: ${newCities.length}`);
  console.log(`   New primary categories: ${newPrimaryCategories.length}`);
  console.log(`   New secondary categories: ${newSecondaryCategories.length}`);
  console.log(`   New postal codes: ${newPostalCodes.length}`);
}

buildFinal();
