/**
 * List businesses whose primary is an "uncertain" category
 * (Manufacturer, Corporate office, Distribution service, Warehouse, Wholesaler).
 */
import {
  createSupabaseClient,
  logSupabaseTarget,
} from "./supabaseClient.js";

const UNCERTAIN = [
  "Manufacturer",
  "Corporate office",
  "Distribution service",
  "Warehouse",
  "Wholesaler",
];

const supabase = createSupabaseClient();

async function main() {
  logSupabaseTarget();

  const { data: cats, error: catErr } = await supabase
    .from("primary_categories")
    .select("id, name")
    .in("name", UNCERTAIN);
  if (catErr) throw catErr;

  for (const cat of cats || []) {
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, title, slug, is_claimed")
      .eq("primary_category_id", cat.id)
      .order("title");
    if (error) throw error;
    console.log(`\n=== ${cat.name} (${(businesses || []).length}) ===`);
    for (const b of businesses || []) {
      console.log(
        `  [${b.is_claimed ? "claimed" : "unclaimed"}] ${b.title}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
