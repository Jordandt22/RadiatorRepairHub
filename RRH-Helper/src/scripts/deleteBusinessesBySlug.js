import {
  createSupabaseClient,
  logSupabaseTarget,
} from "./supabaseClient.js";

const SLUGS = [
  "cobleskill-radiator-4540c12c-f71f-4767-b82c-5d77c309ab50",
];

const dryRun = process.argv.includes("--dry-run");
const supabase = createSupabaseClient();

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function deleteByBusinessIds(businessIds) {
  if (businessIds.length === 0) return;

  for (const ids of chunk(businessIds, 100)) {
    const { error: secondaryError } = await supabase
      .from("business_secondary_categories")
      .delete()
      .in("business_id", ids);
    if (secondaryError) throw secondaryError;

    const { error: featuresError } = await supabase
      .from("business_features")
      .delete()
      .in("business_id", ids);
    if (featuresError) throw featuresError;

    const { error: hoursError } = await supabase
      .from("business_hours")
      .delete()
      .in("business_id", ids);
    if (hoursError) throw hoursError;

    const { error: businessError } = await supabase
      .from("businesses")
      .delete()
      .in("id", ids);
    if (businessError) throw businessError;
  }
}

async function main() {
  logSupabaseTarget();
  console.log(`Looking up ${SLUGS.length} businesses by slug...`);

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, slug, title")
    .in("slug", SLUGS);

  if (error) throw error;

  const found = businesses || [];
  const foundSlugs = new Set(found.map((b) => b.slug));
  const missing = SLUGS.filter((slug) => !foundSlugs.has(slug));

  if (found.length === 0) {
    console.log("No matching businesses found. Nothing to delete.");
    if (missing.length > 0) {
      console.log(`Already missing (${missing.length}):`);
      missing.forEach((slug) => console.log(`   - ${slug}`));
    }
    return;
  }

  console.log(`\nFound ${found.length} businesses to delete:`);
  found.forEach((b) => console.log(`   - ${b.title} (${b.slug})`));

  if (missing.length > 0) {
    console.log(`\nAlready missing (${missing.length}):`);
    missing.forEach((slug) => console.log(`   - ${slug}`));
  }

  if (dryRun) {
    console.log("\nDry run — no rows deleted. Re-run without --dry-run to delete.");
    return;
  }

  console.log(`\nDeleting ${found.length} businesses and related rows...`);
  await deleteByBusinessIds(found.map((b) => b.id));
  console.log(`✅ Deleted ${found.length} businesses`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
