import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Map full state names → two-letter codes
const stateNameToCode = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const getKeyByValue = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

// Upsert states and cities and attach IDs to businesses
async function upsertStatesAndCities(flattened) {
  const stateMap = {}; // code → { code, name }
  const cityMap = {}; // "stateCode|cityName" → { state_code, name }

  for (const biz of flattened) {
    let stateVal = biz.state?.trim();
    if (!stateVal) continue;

    const isCode = stateVal.length === 2;
    const stateCode = isCode
      ? stateVal.toUpperCase()
      : stateNameToCode[stateVal];
    const stateName = isCode
      ? getKeyByValue(stateNameToCode, stateCode)
      : stateVal;

    if (!stateMap[stateCode]) {
      stateMap[stateCode] = {
        code: stateCode,
        name: stateName || stateCode,
        country_code: "US",
      };
    }
  }

  // Upsert states
  const { data: statesData, error: upsertStatesError } = await supabase
    .from("states")
    .upsert(Object.values(stateMap), { onConflict: ["code"] })
    .select("id, code");
  if (upsertStatesError) {
    console.error(upsertStatesError);
    return;
  }

  const stateIdMap = Object.fromEntries(statesData.map((s) => [s.code, s.id]));

  // Upsert cities
  const citiesToUpsert = Object.values(cityMap).map((c) => ({
    ...c,
    state_id: stateIdMap[c.state_code],
  }));

  const { data: citiesData, error: upsertCitiesError } = await supabase
    .from("cities")
    .upsert(citiesToUpsert, { onConflict: ["state_id", "name"] })
    .select("id, state_id, name");
  if (upsertCitiesError) {
    console.error(upsertCitiesError);
    return;
  }

  const cityIdMap = Object.fromEntries(
    citiesData.map((c) => [`${c.state_id}|${c.name}`, c.id])
  );

  // Assign IDs to businesses
  for (const biz of flattened) {
    const stateCode =
      biz.state?.trim().length === 2
        ? biz.state.toUpperCase()
        : stateNameToCode[biz.state];
    const stateName =
      stateCode?.length === 2
        ? getKeyByValue(stateNameToCode, stateCode)
        : biz.state;

    biz.state_id = stateIdMap[stateName] || null;
    if (biz.city && stateName && stateIdMap[stateName]) {
      const key = `${stateIdMap[stateName]}|${biz.city.trim()}`;
      biz.city_id = cityIdMap[key] || null;
    }
  }
}

// Main
async function main() {
  const rawData = fs.readFileSync("./src/formatted/final.json", "utf-8");
  const businesses = JSON.parse(rawData);
  await upsertStatesAndCities(businesses);

  console.log("✅ Added Cities and States to Supabase.");
}

main().catch(console.error);
