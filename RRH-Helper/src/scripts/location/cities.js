import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function addCities() {
  // Load businesses
  const businesses = JSON.parse(
    fs.readFileSync("./src/data/formatted.json", "utf-8")
  );

  // Load states JSON (must already have the `id`, `name`, `code`)
  const states = JSON.parse(fs.readFileSync("./src/data/states.json", "utf-8"));
  const stateMapByCode = Object.fromEntries(states.map((s) => [s.code, s]));
  const stateMapByName = Object.fromEntries(
    states.map((s) => [s.name.toUpperCase(), s])
  );

  // Collect unique city+state combos
  const cityMap = {};
  for (const biz of businesses) {
    if (!biz.city || !biz.state) continue;

    const stateName = biz.state.trim().toUpperCase();
    const isCode = stateName.length === 2;
    const state = isCode
      ? stateMapByCode[stateName]
      : stateMapByName[stateName];
    if (!state) {
      console.warn(`⚠️ No state found for code: ${biz.state}`);
      continue;
    }

    const cityKey = `${state.id}|${biz.city.trim()}`;
    if (!cityMap[cityKey]) {
      cityMap[cityKey] = {
        name: biz.city.trim(),
        state_id: state.id,
      };
    }
  }

  const citiesToInsert = Object.values(cityMap);

  if (citiesToInsert.length === 0) {
    console.log("⚠️ No cities to insert.");
    return { data: [], error: null };
  }

  // Upsert into Supabase
  const { data, error } = await supabase
    .from("cities")
    .upsert(citiesToInsert, { onConflict: ["state_id", "name"] })
    .select("id, name, state_id");

  return { data, error };
}
