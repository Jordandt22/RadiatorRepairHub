/**
 * Sync cdn_stored=true on Supabase from local photos batch photos.json manifests.
 *
 * Collects unique place_ids that have a real Cloudinary URL (successful upload),
 * then updates matching businesses rows.
 *
 * Flags:
 *   --dry-run  Log planned updates; no DB writes
 *   --force    Update even if cdn_stored is already true
 *
 * Usage:
 *   npm run sync-cdn-stored-prod
 *   npm run sync-cdn-stored-prod -- --dry-run
 *   npm run sync-cdn-stored-dev
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSupabaseClient,
  logSupabaseTarget,
} from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");
const PHOTOS_DIR = path.join(SRC_ROOT, "photos");

const UPDATE_CHUNK = 100;

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const supabase = createSupabaseClient();

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function listPhotoBatchDirs() {
  if (!fs.existsSync(PHOTOS_DIR)) return [];
  return fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^batch-\d+$/.test(d.name))
    .map((d) => ({
      name: d.name,
      num: Number(d.name.slice("batch-".length)),
      path: path.join(PHOTOS_DIR, d.name),
    }))
    .sort((a, b) => a.num - b.num);
}

function hasCloudinaryUrl(entry) {
  return (
    typeof entry?.cloudinary_url === "string" &&
    entry.cloudinary_url.trim() !== "" &&
    entry.cloudinary_url !== "(dry-run)"
  );
}

/** Unique place_ids that successfully uploaded to Cloudinary (prefer richer entry). */
function loadSuccessfulPlaceIds() {
  const byPlaceId = new Map();

  for (const batch of listPhotoBatchDirs()) {
    const entries = loadJson(path.join(batch.path, "photos.json"), []);
    for (const entry of entries) {
      const placeId =
        typeof entry?.place_id === "string" ? entry.place_id.trim() : "";
      if (!placeId || !hasCloudinaryUrl(entry)) continue;
      if (entry.status === "no_photos" || entry.status === "error") continue;

      const prev = byPlaceId.get(placeId);
      if (!prev || (entry.cdn_stored && !prev.cdn_stored)) {
        byPlaceId.set(placeId, entry);
      }
    }
  }

  return [...byPlaceId.keys()];
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function markCdnStored(placeIds) {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      cdn_stored: true,
      updated_at: new Date().toISOString(),
    })
    .in("place_id", placeIds)
    .select("id, place_id");

  if (error) throw error;
  return data || [];
}

async function main() {
  logSupabaseTarget();

  if (dryRun) console.log("Dry run — no rows will be written\n");
  if (force) console.log("Force mode — updating even if already cdn_stored\n");

  const batches = listPhotoBatchDirs();
  if (batches.length === 0) {
    throw new Error(`No photos/batch-* folders found under ${PHOTOS_DIR}`);
  }

  const placeIds = loadSuccessfulPlaceIds();
  console.log(
    `Batches: ${batches.map((b) => b.name).join(", ")}\n` +
      `Manifest place_ids with Cloudinary URL: ${placeIds.length}`
  );

  if (placeIds.length === 0) {
    console.log("Nothing to sync.");
    return;
  }

  let toUpdate = [];
  let found = 0;
  let alreadyTrue = 0;
  let missing = 0;

  for (const ids of chunk(placeIds, UPDATE_CHUNK)) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, place_id, slug, cdn_stored")
      .in("place_id", ids);

    if (error) throw error;

    const byPlace = new Map((data || []).map((r) => [r.place_id, r]));
    for (const placeId of ids) {
      const row = byPlace.get(placeId);
      if (!row) {
        missing++;
        continue;
      }
      found++;
      if (row.cdn_stored && !force) {
        alreadyTrue++;
        continue;
      }
      toUpdate.push(row);
    }
  }

  console.log(
    `Matched in DB: ${found} | already cdn_stored: ${alreadyTrue} | ` +
      `missing place_id: ${missing} | to update: ${toUpdate.length}`
  );

  if (toUpdate.length === 0) {
    console.log("Nothing to update.");
    return;
  }

  if (dryRun) {
    console.log(
      `\nWould set cdn_stored=true for ${toUpdate.length} businesses (showing up to 10):`
    );
    for (const row of toUpdate.slice(0, 10)) {
      console.log(`  - ${row.slug || row.place_id} (${row.place_id})`);
    }
    if (toUpdate.length > 10) {
      console.log(`  … and ${toUpdate.length - 10} more`);
    }
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const rows of chunk(toUpdate, UPDATE_CHUNK)) {
    const ids = rows.map((r) => r.place_id);
    try {
      const result = await markCdnStored(ids);
      updated += result.length;
      console.log(`Updated chunk: ${result.length} (total ${updated})`);
    } catch (err) {
      failed += ids.length;
      console.error(`Chunk failed (${ids.length}): ${err.message}`);
    }
  }

  console.log(
    `\nDone. updated: ${updated} | failed: ${failed} | skipped_already: ${alreadyTrue} | missing: ${missing}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
