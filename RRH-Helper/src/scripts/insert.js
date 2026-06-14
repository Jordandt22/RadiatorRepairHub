import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { insertBusinesses } from "./supabase.js";
import { createSupabaseClient, logSupabaseTarget } from "./supabaseClient.js";
import { FLOW_PATHS, ensureFlowDirs } from "./flowPaths.js";

ensureFlowDirs();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SUPABASE_DIR = path.join(ROOT, "supabase");

const FINAL_FILE = FLOW_PATHS.final;

const supabase = createSupabaseClient();

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function isDuplicateError(error) {
  if (!error) return false;
  if (error.code === "23505") return true;
  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return message.includes("duplicate key") || message.includes("already exists");
}

function buildSnapshotStateMaps(states) {
  return {
    idToCode: Object.fromEntries(states.map((s) => [s.id, s.code])),
  };
}

function buildCityMetaLookup(snapshotCities, newCities, stateIdToCode) {
  const lookup = {};

  for (const city of [...snapshotCities, ...newCities]) {
    const stateCode = city.state_code || stateIdToCode[city.state_id];
    if (!city.slug || !city.state_id || !stateCode) continue;

    lookup[city.id] = {
      slug: city.slug,
      stateId: city.state_id,
      stateCode,
    };
  }

  return lookup;
}

function normalizeStateCode(stateCode) {
  return stateCode?.toString().toUpperCase();
}

function cityNaturalKey(slug, stateId, stateCode) {
  return `${slug}|${stateId}|${normalizeStateCode(stateCode)}`;
}

function normalizeCode(code) {
  return code?.toString().toLowerCase();
}

function postalNaturalKey(citySlug, stateCode, code) {
  return `${citySlug}|${stateCode}|${normalizeCode(code)}`;
}

async function fetchTargetStateRecords() {
  const { data, error } = await supabase.from("states").select("id, code");
  if (error) throw error;
  return data;
}

async function fetchTargetStateIdByCode() {
  const states = await fetchTargetStateRecords();
  return Object.fromEntries(states.map((state) => [state.code, state.id]));
}

async function fetchTargetCityIdByNaturalKey() {
  const states = await fetchTargetStateRecords();
  const codeByStateId = Object.fromEntries(
    states.map((state) => [state.id, state.code])
  );

  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, state_id");
  if (error) throw error;

  return Object.fromEntries(
    data
      .filter((city) => codeByStateId[city.state_id])
      .map((city) => [
        cityNaturalKey(
          city.slug,
          city.state_id,
          codeByStateId[city.state_id]
        ),
        city.id,
      ])
  );
}

async function fetchTargetPrimaryCategoryIdBySlug() {
  const { data, error } = await supabase
    .from("primary_categories")
    .select("id, slug");
  if (error) throw error;

  return Object.fromEntries(data.map((category) => [category.slug, category.id]));
}

async function fetchTargetSecondaryCategoryIdBySlug() {
  const { data, error } = await supabase
    .from("secondary_categories")
    .select("id, slug");
  if (error) throw error;

  return Object.fromEntries(data.map((category) => [category.slug, category.id]));
}

async function fetchTargetPostalCodeIdByNaturalKey() {
  const states = await fetchTargetStateRecords();
  const codeByStateId = Object.fromEntries(
    states.map((state) => [state.id, state.code])
  );

  const { data: cities, error: citiesError } = await supabase
    .from("cities")
    .select("id, slug, state_id");
  if (citiesError) throw citiesError;

  const cityMetaById = Object.fromEntries(
    cities
      .filter((city) => codeByStateId[city.state_id])
      .map((city) => [
        city.id,
        {
          slug: city.slug,
          stateCode: codeByStateId[city.state_id],
        },
      ])
  );

  const { data, error } = await supabase
    .from("postal_codes")
    .select("id, code, city_id");
  if (error) throw error;

  const lookup = {};

  for (const postalCode of data) {
    const meta = cityMetaById[postalCode.city_id];
    if (!meta) continue;

    lookup[postalNaturalKey(meta.slug, meta.stateCode, postalCode.code)] =
      postalCode.id;
  }

  return lookup;
}

async function insertReferenceRecords(table, records, label) {
  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    const { error } = await supabase.from(table).insert(record);

    if (error) {
      if (isDuplicateError(error)) {
        skipped++;
        continue;
      }
      console.error(`❌ Error inserting ${label}:`, error);
      return false;
    }

    inserted++;
  }

  if (skipped > 0) {
    console.log(
      `✅ ${label}: inserted ${inserted}, skipped ${skipped} duplicate(s)`
    );
  } else {
    console.log(`✅ Inserted ${inserted} ${label}`);
  }

  return true;
}

async function buildReferenceIdMaps() {
  const snapshotStates = loadJson(path.join(SUPABASE_DIR, "states.json"));
  const snapshotCities = loadJson(path.join(SUPABASE_DIR, "cities.json"));
  const { idToCode: snapshotStateIdToCode } =
    buildSnapshotStateMaps(snapshotStates);

  const newCities = loadJson(FLOW_PATHS.newCities);
  const newPostalCodes = loadJson(FLOW_PATHS.newPostalCodes);
  const cityMetaByLocalId = buildCityMetaLookup(
    snapshotCities,
    newCities,
    snapshotStateIdToCode
  );

  const targetStateIdByCode = await fetchTargetStateIdByCode();
  const targetCityIdByNaturalKey = await fetchTargetCityIdByNaturalKey();
  const targetPostalCodeIdByNaturalKey =
    await fetchTargetPostalCodeIdByNaturalKey();

  const maps = {
    states: {},
    cities: {},
    primaryCategories: {},
    secondaryCategories: {},
    postalCodes: {},
  };

  for (const state of snapshotStates) {
    const targetStateId = targetStateIdByCode[state.code];
    if (targetStateId) {
      maps.states[state.id] = targetStateId;
    }
  }

  for (const [localCityId, meta] of Object.entries(cityMetaByLocalId)) {
    const targetStateId = maps.states[meta.stateId];
    if (!targetStateId) continue;

    const targetCityId =
      targetCityIdByNaturalKey[
        cityNaturalKey(meta.slug, targetStateId, meta.stateCode)
      ];
    if (targetCityId) {
      maps.cities[localCityId] = targetCityId;
    }
  }

  const newPrimary = loadJson(FLOW_PATHS.newPrimaryCategories);
  const newSecondary = loadJson(FLOW_PATHS.newSecondaryCategories);
  const snapshotPrimary = loadJson(
    path.join(SUPABASE_DIR, "primary_categories.json")
  );
  const snapshotSecondary = loadJson(
    path.join(SUPABASE_DIR, "secondary_categories.json")
  );
  const targetPrimaryCategoryIdBySlug = await fetchTargetPrimaryCategoryIdBySlug();
  const targetSecondaryCategoryIdBySlug =
    await fetchTargetSecondaryCategoryIdBySlug();

  for (const category of [...snapshotPrimary, ...newPrimary]) {
    const targetCategoryId = targetPrimaryCategoryIdBySlug[category.slug];
    if (targetCategoryId) {
      maps.primaryCategories[category.id] = targetCategoryId;
    }
  }

  for (const category of [...snapshotSecondary, ...newSecondary]) {
    const targetCategoryId = targetSecondaryCategoryIdBySlug[category.slug];
    if (targetCategoryId) {
      maps.secondaryCategories[category.id] = targetCategoryId;
    }
  }

  for (const postalCode of newPostalCodes) {
    const meta =
      postalCode.city_slug && postalCode.state_code
        ? { slug: postalCode.city_slug, stateCode: postalCode.state_code }
        : cityMetaByLocalId[postalCode.city_id];

    if (!meta) continue;

    const targetPostalCodeId =
      targetPostalCodeIdByNaturalKey[
        postalNaturalKey(meta.slug, meta.stateCode, postalCode.code)
      ];
    if (targetPostalCodeId) {
      maps.postalCodes[postalCode.id] = targetPostalCodeId;
    }
  }

  return maps;
}

function remapBusinessReferences(businesses, maps) {
  return businesses.map((business) => ({
    ...business,
    state_id: maps.states[business.state_id] ?? business.state_id,
    city_id: maps.cities[business.city_id] ?? business.city_id,
    postal_code_id:
      maps.postalCodes[business.postal_code_id] ?? business.postal_code_id,
    primary_category_id:
      maps.primaryCategories[business.primary_category_id] ??
      business.primary_category_id,
    secondary_category_ids: (business.secondary_category_ids || []).map(
      (id) => maps.secondaryCategories[id] ?? id
    ),
  }));
}

async function insertCitiesAndCategories() {
  const snapshotStates = loadJson(path.join(SUPABASE_DIR, "states.json"));
  const { idToCode: snapshotStateIdToCode } =
    buildSnapshotStateMaps(snapshotStates);
  const targetStateIdByCode = await fetchTargetStateIdByCode();

  const newCities = loadJson(FLOW_PATHS.newCities).map((city) => {
    const stateCode = city.state_code || snapshotStateIdToCode[city.state_id];
    const targetStateId = stateCode ? targetStateIdByCode[stateCode] : null;

    return {
      id: city?.id,
      name: city?.name,
      slug: city?.slug,
      state_id: targetStateId ?? city.state_id,
    };
  });

  const referenceSets = [
    { records: newCities, table: "cities", label: "cities" },
    {
      file: FLOW_PATHS.newPrimaryCategories,
      table: "primary_categories",
      label: "primary categories",
    },
    {
      file: FLOW_PATHS.newSecondaryCategories,
      table: "secondary_categories",
      label: "secondary categories",
    },
  ];

  for (const { records, file, table, label } of referenceSets) {
    const rows = records ?? loadJson(file);
    if (rows.length === 0) continue;

    const ok = await insertReferenceRecords(table, rows, label);
    if (!ok) return false;
  }

  return true;
}

async function insertPostalCodes(referenceIdMaps) {
  const newPostalCodes = loadJson(FLOW_PATHS.newPostalCodes).map(
    (postalCode) => ({
      id: postalCode.id,
      code: postalCode.code,
      city_id:
        referenceIdMaps.cities[postalCode.city_id] ?? postalCode.city_id,
    })
  );

  if (newPostalCodes.length === 0) return true;

  return insertReferenceRecords(
    "postal_codes",
    newPostalCodes,
    "postal codes"
  );
}

async function main() {
  if (!fs.existsSync(FINAL_FILE)) {
    throw new Error(
      `final.json not found: ${FINAL_FILE}. Run "npm run build-final" first.`
    );
  }

  const businesses = loadJson(FINAL_FILE);
  const existing = loadJson(path.join(SUPABASE_DIR, "businesses.json"));
  const existingPlaceIds = new Set(existing.map((b) => b.place_id).filter(Boolean));

  const toInsert = businesses.filter((b) => {
    if (existingPlaceIds.has(b.place_id)) {
      console.warn(`⚠️ Skipping duplicate place_id: ${b.title} (${b.place_id})`);
      return false;
    }
    return true;
  });

  if (toInsert.length === 0) {
    console.log("⚠️ No new businesses to insert");
    return;
  }

  logSupabaseTarget();
  console.log(`Reading from flow/final/final.json`);
  console.log(`Inserting ${toInsert.length} of ${businesses.length} businesses...`);

  const citiesOk = await insertCitiesAndCategories();
  if (!citiesOk) {
    process.exit(1);
  }

  let referenceIdMaps = await buildReferenceIdMaps();

  const postalOk = await insertPostalCodes(referenceIdMaps);
  if (!postalOk) {
    process.exit(1);
  }

  referenceIdMaps = await buildReferenceIdMaps();
  const remappedToInsert = remapBusinessReferences(toInsert, referenceIdMaps);

  const success = await insertBusinesses(remappedToInsert);
  if (!success) {
    process.exit(1);
  }

  console.log("✅ Insert complete");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
