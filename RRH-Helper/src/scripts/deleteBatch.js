import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { FLOW_PATHS, ensureFlowDirs } from "./flowPaths.js";

dotenv.config();

ensureFlowDirs();

const FINAL_FILE = FLOW_PATHS.final;

const supabaseUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_SUPABASE_URL
    : process.env.SUPABASE_URL;
const supabaseKey =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_SUPABASE_KEY
    : process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function deleteByBusinessIds(businessIds) {
  if (businessIds.length === 0) return;

  for (const ids of chunk(businessIds, 100)) {
    const { error: secondaryError } = await supabase
      .from("business_secondary_categories")
      .delete()
      .in("business_id", ids);
    if (secondaryError) throw secondaryError;

    const { error: featuresError } = await supabase
      .from("business_features")
      .delete()
      .in("business_id", ids);
    if (featuresError) throw featuresError;

    const { error: hoursError } = await supabase
      .from("business_hours")
      .delete()
      .in("business_id", ids);
    if (hoursError) throw hoursError;

    const { error: businessError } = await supabase
      .from("businesses")
      .delete()
      .in("id", ids);
    if (businessError) throw businessError;
  }
}

async function deleteByIds(table, ids, label) {
  if (ids.length === 0) {
    console.log(`⏭️  No ${label} to delete`);
    return;
  }

  for (const batch of chunk(ids, 100)) {
    const { error } = await supabase.from(table).delete().in("id", batch);
    if (error) {
      console.error(`❌ Error deleting ${label}:`, error.message);
      return false;
    }
  }

  console.log(`✅ Deleted ${ids.length} ${label}`);
  return true;
}

async function main() {
  if (!fs.existsSync(FINAL_FILE)) {
    throw new Error(
      `final.json not found: ${FINAL_FILE}. Run "npm run build-final" first.`
    );
  }

  const businesses = loadJson(FINAL_FILE);
  const placeIds = businesses.map((b) => b.place_id).filter(Boolean);

  if (placeIds.length === 0) {
    throw new Error("No place_id values found in flow/final/final.json");
  }

  console.log(`Reading from flow/final/final.json`);
  console.log(`Looking up ${placeIds.length} businesses...`);

  const { data: dbBusinesses, error: lookupError } = await supabase
    .from("businesses")
    .select("id, place_id, title")
    .in("place_id", placeIds);

  if (lookupError) throw lookupError;

  const foundIds = (dbBusinesses || []).map((b) => b.id);
  const foundPlaceIds = new Set((dbBusinesses || []).map((b) => b.place_id));
  const missingPlaceIds = placeIds.filter((id) => !foundPlaceIds.has(id));

  if (missingPlaceIds.length > 0) {
    console.warn(
      `⚠️ ${missingPlaceIds.length} place_id(s) not found in Supabase (already deleted or never inserted)`
    );
  }

  if (foundIds.length > 0) {
    console.log(`Deleting ${foundIds.length} businesses and related rows...`);
    dbBusinesses.forEach((b) => console.log(`   - ${b.title} (${b.place_id})`));
    await deleteByBusinessIds(foundIds);
    console.log(`✅ Deleted ${foundIds.length} businesses`);
  } else {
    console.log("⏭️  No matching businesses to delete");
  }

  const referenceSets = [
    {
      file: FLOW_PATHS.newSecondaryCategories,
      table: "secondary_categories",
      label: "secondary categories",
    },
    {
      file: FLOW_PATHS.newPrimaryCategories,
      table: "primary_categories",
      label: "primary categories",
    },
    {
      file: FLOW_PATHS.newPostalCodes,
      table: "postal_codes",
      label: "postal codes",
    },
    { file: FLOW_PATHS.newCities, table: "cities", label: "cities" },
  ];

  for (const { file, table, label } of referenceSets) {
    const records = loadJson(file);
    const ids = records.map((r) => r.id).filter(Boolean);
    await deleteByIds(table, ids, label);
  }

  console.log("\n✅ Batch delete complete");
  console.log(
    "Deleted: businesses from flow/final/final.json, plus rows in flow/final/new_postal_codes.json, new_cities.json, new_primary_categories.json, and new_secondary_categories.json."
  );
  console.log(
    "Not deleted: existing cities like Phoenix (unless listed in new_cities.json), or any data outside this batch."
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
