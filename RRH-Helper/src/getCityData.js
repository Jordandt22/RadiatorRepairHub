import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Load env vars
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function generateCitiesJSON() {
  // 1. Fetch all cities
  const { data, error } = await supabase.from("cities").select("*");

  if (error) {
    console.error("Error fetching cities:", error.message);
    return;
  }

  fs.writeFileSync(
    "./src/client_files/cities.json",
    JSON.stringify(data, null, 2)
  );
  console.log("✅ Formatted data saved as cities.json");
}

generateCitiesJSON().catch(console.error);
