import { formatBusinesses } from "./scripts/format.js";
import { addLocations } from "./scripts/location/location.js";
import { addCategories } from "./scripts/categories.js";
import { updateBusinesses } from "./scripts/update.js";
import { addBusinessesToSupabase } from "./scripts/supabase.js";

async function main() {
  // Format businesses
  formatBusinesses();

  // Add Locations
  await addLocations();

  // Add Categories
  await addCategories();

  // Update Businesses
  await updateBusinesses();

  // Add Businesses to Supabase
  await addBusinessesToSupabase();
}

main().catch(console.error);
