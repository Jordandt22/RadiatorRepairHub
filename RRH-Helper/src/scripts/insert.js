import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { insertBusinesses } from "./supabase.js";
import { createSupabaseClient, logSupabaseTarget } from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "raw");
const SUPABASE_DIR = path.join(ROOT, "supabase");

const FINAL_FILE = path.join(RAW_DIR, "final.json");

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
  const maps = {
    cities: {},
    primaryCategories: {},
    secondaryCategories: {},
    postalCodes: {},
  };

  const newCities = loadJson(path.join(RAW_DIR, "new_cities.json"));
  for (const city of newCities) {
    const { data } = await supabase
      .from("cities")
      .select("id")
      .eq("state_id", city.state_id)
      .eq("slug", city.slug)
      .maybeSingle();
    if (data) maps.cities[city.id] = data.id;
  }

  const newPrimary = loadJson(path.join(RAW_DIR, "new_primary_categories.json"));
  for (const category of newPrimary) {
    const { data } = await supabase
      .from("primary_categories")
      .select("id")
      .eq("slug", category.slug)
      .maybeSingle();
    if (data) maps.primaryCategories[category.id] = data.id;
  }

  const newSecondary = loadJson(
    path.join(RAW_DIR, "new_secondary_categories.json")
  );
  for (const category of newSecondary) {
    const { data } = await supabase
      .from("secondary_categories")
      .select("id")
      .eq("slug", category.slug)
      .maybeSingle();
    if (data) maps.secondaryCategories[category.id] = data.id;
  }

  const newPostalCodes = loadJson(path.join(RAW_DIR, "new_postal_codes.json"));
  for (const postalCode of newPostalCodes) {
    const { data } = await supabase
      .from("postal_codes")
      .select("id")
      .eq("city_id", postalCode.city_id)
      .eq("code", postalCode.code)
      .maybeSingle();
    if (data) maps.postalCodes[postalCode.id] = data.id;
  }

  return maps;
}

function remapBusinessReferences(businesses, maps) {
  return businesses.map((business) => ({
    ...business,
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

async function insertReferenceData() {
  const referenceSets = [
    { file: "new_cities.json", table: "cities", label: "cities" },
    {
      file: "new_primary_categories.json",
      table: "primary_categories",
      label: "primary categories",
    },
    {
      file: "new_secondary_categories.json",
      table: "secondary_categories",
      label: "secondary categories",
    },
    { file: "new_postal_codes.json", table: "postal_codes", label: "postal codes" },
  ];

  for (const { file, table, label } of referenceSets) {
    const records = loadJson(path.join(RAW_DIR, file));
    if (records.length === 0) continue;

    const ok = await insertReferenceRecords(table, records, label);
    if (!ok) return false;
  }

  return true;
}

async function main() {
  if (!fs.existsSync(FINAL_FILE)) {
    throw new Error(`final.json not found: ${FINAL_FILE}. Run "npm run build-final" first.`);
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
  console.log(`Inserting ${toInsert.length} of ${businesses.length} businesses...`);

  const referenceOk = await insertReferenceData();
  if (!referenceOk) {
    process.exit(1);
  }

  const referenceIdMaps = await buildReferenceIdMaps();
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
