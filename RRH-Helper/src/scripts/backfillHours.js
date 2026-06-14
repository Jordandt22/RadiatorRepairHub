import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buildBusinessHoursRows } from "./supabase.js";
import { FLOW_PATHS } from "./flowPaths.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

async function main() {
  if (!fs.existsSync(FINAL_FILE)) {
    throw new Error(`final.json not found: ${FINAL_FILE}`);
  }

  const businesses = JSON.parse(fs.readFileSync(FINAL_FILE, "utf-8"));
  let updated = 0;
  let skipped = 0;

  for (const business of businesses) {
    const businessId = business.id;
    if (!businessId) {
      console.warn(`⚠️ Skipping ${business.title}: no id`);
      skipped++;
      continue;
    }

    const rows = buildBusinessHoursRows(businessId, business.opening_hours);

    const { error: deleteError } = await supabase
      .from("business_hours")
      .delete()
      .eq("business_id", businessId);

    if (deleteError) {
      console.error(`❌ Delete failed for ${business.title}:`, deleteError);
      continue;
    }

    const { error: insertError } = await supabase
      .from("business_hours")
      .insert(rows);

    if (insertError) {
      console.error(`❌ Insert failed for ${business.title}:`, insertError);
      continue;
    }

    updated++;
    console.log(`✅ ${business.title} (${rows.length} days)`);
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
