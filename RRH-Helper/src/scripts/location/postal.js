import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Helper: convert ZIP to string, trim, handle nulls
function normalizePostalCode(zip) {
  if (!zip) return null;
  return zip.toString().trim();
}

export async function addPostalCodes() {
  const businesses = JSON.parse(
    fs.readFileSync("./src/data/formatted.json", "utf-8")
  );
  const states = JSON.parse(fs.readFileSync("./src/data/states.json", "utf-8"));
  const cities = JSON.parse(fs.readFileSync("./src/data/cities.json", "utf-8"));
  const postalMap = {}; // "cityId|zip" → { code, city_id }
  const stateMap = Object.fromEntries(
    states.map((s) => [s.name.toLowerCase(), s])
  );
  const stateCodeMap = Object.fromEntries(
    states.map((s) => [s.code.toLowerCase(), s])
  );

  // Collect unique postal codes per city
  for (const biz of businesses) {
    if (!biz.postal_code || !biz.city) continue;
    const code = normalizePostalCode(biz.postal_code);
    const stateVal = biz.state?.trim().toLowerCase();
    let state = stateMap[stateVal] || stateCodeMap[stateVal];
    const cityId = cities.find(
      (c) => c.name === biz.city && c.state_id === state?.id
    )?.id;
    const key = `${cityId}|${code}`;
    if (!postalMap[key]) {
      postalMap[key] = {
        code,
        city_id: cityId,
      };
    }
  }

  const postalList = Object.values(postalMap);

  // Upsert postal codes
  const { data: postalData, error } = await supabase
    .from("postal_codes")
    .upsert(postalList, { onConflict: ["code", "city_id"] })
    .select("id, code, city_id");

  return { data: postalData, error };
}
