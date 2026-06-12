import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { insertBusinesses } from "./supabase.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "raw");
const SUPABASE_DIR = path.join(ROOT, "supabase");

const FINAL_FILE = path.join(RAW_DIR, "final.json");

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

    const { error } = await supabase.from(table).insert(records);
    if (error) {
      console.error(`❌ Error inserting ${label}:`, error);
      return false;
    }

    console.log(`✅ Inserted ${records.length} ${label}`);
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

  console.log(`Inserting ${toInsert.length} of ${businesses.length} businesses...`);

  const referenceOk = await insertReferenceData();
  if (!referenceOk) {
    process.exit(1);
  }

  const success = await insertBusinesses(toInsert);
  if (!success) {
    process.exit(1);
  }

  console.log("✅ Insert complete");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
