import { find } from "geo-tz";
import { createSupabaseClient, logSupabaseTarget } from "./supabaseClient.js";

const PAGE_SIZE = 500;
const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

const supabase = createSupabaseClient();

function resolveTimezone(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  try {
    const zones = find(lat, lng);
    return zones[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchBusinessPage(from) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, title, latitude, longitude, timezone")
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  if (error) throw error;
  return data ?? [];
}

async function updateTimezone(id, timezone) {
  const { error } = await supabase
    .from("businesses")
    .update({ timezone })
    .eq("id", id);

  if (error) throw error;
}

async function main() {
  logSupabaseTarget();

  if (dryRun) {
    console.log("Dry run — no rows will be written\n");
  }

  if (force) {
    console.log("Force mode — re-resolving all businesses with coordinates\n");
  }

  let from = 0;
  let updated = 0;
  let noCoords = 0;
  let unchanged = 0;
  let failed = 0;

  while (true) {
    const businesses = await fetchBusinessPage(from);
    if (businesses.length === 0) break;

    for (const business of businesses) {
      const { id, title, latitude, longitude, timezone: existing } = business;

      if (latitude == null || longitude == null) {
        noCoords++;
        continue;
      }

      if (!force && existing) {
        unchanged++;
        continue;
      }

      const timezone = resolveTimezone(latitude, longitude);

      if (!force && timezone === existing) {
        unchanged++;
        continue;
      }

      if (dryRun) {
        console.log(
          `[dry-run] ${title}: (${latitude}, ${longitude}) → ${timezone ?? "null"}`
        );
        updated++;
        continue;
      }

      try {
        await updateTimezone(id, timezone);
        updated++;
        console.log(`✅ ${title} → ${timezone ?? "null"}`);
      } catch (err) {
        failed++;
        console.error(`❌ ${title}:`, err.message ?? err);
      }
    }

    if (businesses.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log("\nDone");
  console.log(`  Updated:   ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  No coords: ${noCoords}`);
  if (failed > 0) console.log(`  Failed:    ${failed}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
