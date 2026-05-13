import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- Bulk Insert Function ---
async function insertBusinesses(businessArray) {
  const businessInserts = businessArray.map((b) => ({
    title: b.title,
    address: b.address,
    neighborhood: b.neighborhood,
    street: b.street,
    city_id: b.city_id,
    postal_code_id: b.postal_code_id,
    state_id: b.state_id,
    country_code: b.country_code,
    website: b.website,
    phone: b.phone,
    phone_unformatted: b.phone_unformatted,
    total_score: b.total_score,
    permanently_closed: b.permanently_closed === "TRUE",
    temporarily_closed: b.temporarily_closed === "TRUE",
    place_id: b.place_id,
    primary_category_id: b.primary_category_id,
    fid: b.fid,
    cid: b.cid,
    reviews_count: Number(b.reviews_count),
    images_count: Number(b.images_count),
    scraped_at: b.scraped_at,
    opening_hours: b.opening_hours,
    additional_info: b.additional_info,
    url: b.url,
    search_page_url: b.search_page_url,
    search_string: b.search_string,
    language: b.language,
    rank: Number(b.rank),
    is_advertisement: b.is_advertisement === "TRUE",
    image_url: b.image_url,
    kgmid: b.kgmid,
    reviews_distribution: b.reviews_distribution || {},
    latitude: b.latitude,
    longitude: b.longitude,
    description: b.description,
    service_tags: b.service_tags,
    title_tag: b.title_tag,
    meta_description: b.meta_description,
    local_note: b.local_note,
    opening_hours_specification: b.opening_hours_specification || {},
    keywords: b.keywords,
  }));

  const { data: insertedBusinesses, error: businessError } = await supabase
    .from("businesses")
    .insert(businessInserts)
    .select("id, place_id");

  if (businessError) {
    console.error("❌ Error inserting businesses:", businessError);
    return;
  }

  console.log(`✅ Inserted ${insertedBusinesses.length} businesses`);

  const idMap = Object.fromEntries(
    insertedBusinesses.map((b) => [b.place_id, b.id])
  );

  // Step 2: Process business_hours and features
  const hoursInserts = [];
  const featuresInserts = [];
  const secondaryCategoriesInserts = [];

  for (const b of businessArray) {
    const businessId = idMap[b.place_id];
    if (!businessId) continue;

    // Map days to hours string
    const dayMap = new Map(
      (b.opening_hours || []).map((h) => [h.day, h.hours])
    );

    for (const day of DAYS) {
      const hoursStr = dayMap.get(day);

      if (!hoursStr || hoursStr.toLowerCase().includes("closed")) {
        hoursInserts.push({
          business_id: businessId,
          day_of_week: day,
          hours: [],
          is_closed: true,
        });
      } else if (
        hoursStr.toLowerCase().includes("24 hours") ||
        hoursStr.toLowerCase().includes("open 24 hours")
      ) {
        hoursInserts.push({
          business_id: businessId,
          day_of_week: day,
          hours: [{ opening_time: "00:00:00", closing_time: "23:59:59" }],
          is_closed: false,
        });
      } else {
        const periods = parseMultipleHours(hoursStr);
        hoursInserts.push({
          business_id: businessId,
          day_of_week: day,
          hours: periods,
          is_closed: false,
        });
      }
    }

    // Features
    featuresInserts.push({
      business_id: businessId,
      mechanic: b.mechanic || false,
      restroom: b.restroom || false,
      credit_cards: b.credit_cards || false,
      debit_cards: b.debit_cards || false,
      wheelchair_accessible: b.wheelchair_accessible || false,
      onsite_services: b.onsite_services || false,
      oil_change: b.oil_change || false,
      nfc_mobile_payments: b.nfc_mobile_payments || false,
      appointments_recommended: b.appointments_recommended || false,
    });

    // Secondary Categories
    for (const secondary_category_id of b.secondary_category_ids) {
      secondaryCategoriesInserts.push({
        business_id: businessId,
        secondary_category_id,
      });
    }
  }

  // Insert business_hours
  if (hoursInserts.length > 0) {
    const { error: hoursError } = await supabase
      .from("business_hours")
      .insert(hoursInserts);
    if (hoursError) console.error("❌ Error inserting hours:", hoursError);
    else console.log(`✅ Inserted ${hoursInserts.length} business_hours`);
  }

  // Insert features
  if (featuresInserts.length > 0) {
    const { error: featuresError } = await supabase
      .from("business_features")
      .insert(featuresInserts);
    if (featuresError)
      console.error("❌ Error inserting features:", featuresError);
    else console.log(`✅ Inserted ${featuresInserts.length} business_features`);
  }

  // Insert secondary categories
  if (secondaryCategoriesInserts.length > 0) {
    const { error: secondaryCategoriesError } = await supabase
      .from("business_secondary_categories")
      .insert(secondaryCategoriesInserts);
    if (secondaryCategoriesError)
      console.error(
        "❌ Error inserting secondary categories:",
        secondaryCategoriesError
      );
    else
      console.log(
        `✅ Inserted ${secondaryCategoriesInserts.length} business_secondary_categories`
      );
  }
}

// Parse multiple periods like "7:45 AM to 12 PM, 1:15 to 5 PM"
function parseMultipleHours(str) {
  const periods = [];
  const parts = str.split(/,/); // Split by comma
  for (const p of parts) {
    const [open, close] = p.split(/\s+to\s+/i).map((s) => s && s.trim());
    if (!open || !close) continue;
    periods.push({
      opening_time: parseSingleTime(open),
      closing_time: parseSingleTime(close),
    });
  }
  return periods;
}

// Parse a single time string into HH:MM:SS
function parseSingleTime(str) {
  str = str
    .trim()
    .toUpperCase()
    .replace(/\u202F/g, ""); // remove narrow spaces
  const match = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  }
  // 24h format
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) return `${match24[1].padStart(2, "0")}:${match24[2]}:00`;
  console.warn(`⚠️ Could not parse time: "${str}"`);
  return null;
}

export async function addBusinessesToSupabase() {
  const rawData = fs.readFileSync("./src/data/updated.json", "utf-8");
  const businesses = JSON.parse(rawData);
  await insertBusinesses(businesses);

  // Write to JSON
  fs.writeFileSync(
    "./src/data/final.json",
    JSON.stringify(businesses, null, 2)
  );

  console.log("✅ Businesses inserted into Supabase");
}
