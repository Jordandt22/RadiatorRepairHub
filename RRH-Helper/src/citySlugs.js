import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";
import dotenv from "dotenv";

dotenv.config();

// Load env vars
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function addCitySlugs() {
  // 1. Fetch all cities
  const { data: cities, error } = await supabase.from("cities").select("*");

  if (error) {
    console.error("Error fetching cities:", error.message);
    return;
  }

  console.log(`Found ${cities.length} cities`);

  // 2. Loop and generate slugs
  for (const city of cities) {
    if (city.slug) {
      console.log(`Skipping ${city.name}, slug already exists`);
      continue;
    }

    // Create slug: "san-francisco-ca"
    const citySlug = slugify(city.name, {
      lower: true,
      strict: true, // remove special chars
    });

    // 3. Update city with slug
    const { error: updateError } = await supabase
      .from("cities")
      .update({ slug: citySlug })
      .eq("id", city.id);

    if (updateError) {
      console.error(`❌ Failed to update ${city.name}:`, updateError.message);
    } else {
      console.log(`✅ Added slug for ${city.name}: ${citySlug}`);
    }
  }

  console.log("🎉 Slug backfill complete");
}

addCitySlugs().catch(console.error);
