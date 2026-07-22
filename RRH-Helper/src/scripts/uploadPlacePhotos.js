/**
 * Download Place Photos (New) locally, then upload each image to Cloudinary.
 * On successful upload, sets businesses.cdn_stored = true in Supabase (by place_id).
 *
 * Rerunnable per step — each business only runs what it still needs:
 *   1) Places download  → skip if local file already exists
 *   2) Cloudinary upload → skip if cloudinary_url already set
 *   3) Supabase flag    → skip if cdn_stored already true
 *
 * Requires in RRH-Helper/.env:
 *   GOOGLE_PLACES_API_KEY  — Places API (New) enabled on that Google Cloud project
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   DEV_SUPABASE_* or SUPABASE_* depending on NODE_ENV
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 *
 * Edit LIMIT at top — how many pending businesses to process this run.
 * Skips anything already complete (across all photos/batch-* manifests),
 * then takes the next LIMIT that still need Places / Cloudinary / cdn_stored.
 * Writes into photos/batch-{N}/ where N is one past the highest existing batch folder.
 *
 * Flags:
 *   --dry-run  Log planned steps; no Places / Cloudinary / Supabase writes
 *   --force    Re-run all steps even if already complete
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import {
  createSupabaseClient,
  logSupabaseTarget,
} from "./supabaseClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");

const BUSINESSES_FILE = path.join(SRC_ROOT, "supabase", "businesses.json");
const PHOTOS_DIR = path.join(SRC_ROOT, "photos");

// How many businesses that still need work to process this run.
const LIMIT = 500;

// Set in main() after choosing the next batch folder.
let BATCH = 1;
let BATCH_DIR = path.join(PHOTOS_DIR, `batch-${BATCH}`);
let PHOTOS_FILE = path.join(BATCH_DIR, "photos.json");

const MAX_WIDTH_PX = 800;
const MAX_HEIGHT_PX = 544;
const DELAY_MIN_MS = 400;
const DELAY_MAX_MS = 600;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const supabase = createSupabaseClient();

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return (
    DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1))
  );
}

function extensionFromContentType(contentType) {
  const type = (contentType || "").split(";")[0].trim().toLowerCase();
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}

function getPlacesApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing GOOGLE_PLACES_API_KEY in RRH-Helper/.env. Places API (New) must be enabled for this key."
    );
  }
  return key;
}

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Missing Cloudinary credentials in RRH-Helper/.env. Need CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

function toRelativePhotoPath(filename) {
  return path.join("photos", `batch-${BATCH}`, filename).replace(/\\/g, "/");
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

function getNextBatchNumber() {
  const batches = listPhotoBatchDirs();
  if (batches.length === 0) return 1;
  return batches[batches.length - 1].num + 1;
}

/** Prefer the most complete manifest row when a slug appears in multiple batches. */
function entryCompleteness(entry) {
  if (!entry) return -1;
  let score = 0;
  if (entry.status === "no_photos") score += 8;
  if (entry.cdn_stored) score += 4;
  if (entry.cloudinary_url && entry.cloudinary_url !== "(dry-run)") score += 2;
  if (entry.local_path) score += 1;
  return score;
}

function loadMergedManifestBySlug() {
  const map = new Map();
  for (const batch of listPhotoBatchDirs()) {
    const entries = loadJson(path.join(batch.path, "photos.json"), []);
    for (const entry of entries) {
      if (!entry?.slug) continue;
      const prev = map.get(entry.slug);
      if (!prev || entryCompleteness(entry) >= entryCompleteness(prev)) {
        map.set(entry.slug, entry);
      }
    }
  }
  return map;
}

/** Resolve an existing local image for this slug (manifest path or any batch folder). */
function findExistingLocalFile(slug, existingEntry) {
  if (existingEntry?.local_path) {
    const fromManifest = path.join(SRC_ROOT, existingEntry.local_path);
    if (fs.existsSync(fromManifest)) {
      return {
        absolutePath: fromManifest,
        relativePath: existingEntry.local_path.replace(/\\/g, "/"),
      };
    }
  }

  for (const batch of listPhotoBatchDirs()) {
    const match = fs.readdirSync(batch.path).find((name) => {
      const ext = path.extname(name).toLowerCase();
      return (
        IMAGE_EXTENSIONS.has(ext) && path.basename(name, ext) === slug
      );
    });

    if (!match) continue;

    return {
      absolutePath: path.join(batch.path, match),
      relativePath: path
        .join("photos", batch.name, match)
        .replace(/\\/g, "/"),
    };
  }

  return null;
}

function baseEntry(business, existingEntry = null) {
  return {
    slug: business.slug,
    place_id: business.place_id,
    title: business.title,
    photo_name: existingEntry?.photo_name ?? null,
    local_path: existingEntry?.local_path ?? null,
    cloudinary_url: existingEntry?.cloudinary_url ?? null,
    cdn_stored: Boolean(existingEntry?.cdn_stored),
    author_attributions: existingEntry?.author_attributions ?? [],
    status: existingEntry?.status ?? "pending",
    error: null,
  };
}

function stepsNeeded(entry, localFile) {
  if (force) {
    return { places: true, cloudinary: true, supabase: true };
  }

  const hasLocal = Boolean(localFile);
  const hasCloudinary =
    Boolean(entry.cloudinary_url) &&
    entry.cloudinary_url !== "(dry-run)";
  const hasCdnFlag = Boolean(entry.cdn_stored);

  if (entry.status === "no_photos") {
    return { places: false, cloudinary: false, supabase: false };
  }

  return {
    places: !hasLocal,
    cloudinary: hasLocal && !hasCloudinary,
    supabase: hasCloudinary && !hasCdnFlag,
  };
}

function needsProcessing(business, manifestBySlug) {
  const existing = manifestBySlug.get(business.slug) || null;
  const localFile = findExistingLocalFile(business.slug, existing);
  const entry = baseEntry(business, existing);
  if (localFile) {
    entry.local_path = localFile.relativePath;
    if (entry.status !== "no_photos") entry.status = "ok";
  }
  const steps = stepsNeeded(entry, localFile);
  return steps.places || steps.cloudinary || steps.supabase;
}

async function fetchPlacePhotos(placeId, apiKey) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "photos",
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `Place Details failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return Array.isArray(body.photos) ? body.photos : [];
}

async function downloadPhotoMedia(photoName, apiKey) {
  const mediaUrl = new URL(
    `https://places.googleapis.com/v1/${photoName}/media`
  );
  mediaUrl.searchParams.set("maxWidthPx", String(MAX_WIDTH_PX));
  mediaUrl.searchParams.set("maxHeightPx", String(MAX_HEIGHT_PX));
  mediaUrl.searchParams.set("key", apiKey);

  const response = await fetch(mediaUrl, { redirect: "follow" });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || errBody?.message || "";
    } catch {
      detail = "";
    }
    throw new Error(
      detail || `Place Photos media failed (${response.status})`
    );
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

async function downloadFromPlaces(business, apiKey) {
  const photos = await fetchPlacePhotos(business.place_id, apiKey);

  if (photos.length === 0) {
    return {
      photo_name: null,
      local_path: null,
      absolute_path: null,
      author_attributions: [],
      status: "no_photos",
    };
  }

  const first = photos[0];
  const { buffer, contentType } = await downloadPhotoMedia(first.name, apiKey);
  const ext = extensionFromContentType(contentType);
  const filename = `${business.slug}${ext}`;
  const absolutePath = path.join(BATCH_DIR, filename);
  const relativePath = toRelativePhotoPath(filename);

  fs.writeFileSync(absolutePath, buffer);

  return {
    photo_name: first.name,
    local_path: relativePath,
    absolute_path: absolutePath,
    author_attributions: Array.isArray(first.authorAttributions)
      ? first.authorAttributions
      : [],
    status: "ok",
  };
}

async function uploadToCloudinary(absolutePath, placeId) {
  const result = await cloudinary.uploader.upload(absolutePath, {
    public_id: `business/${placeId}`,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
}

async function markCdnStored(placeId) {
  const { data, error } = await supabase
    .from("businesses")
    .update({
      cdn_stored: true,
      updated_at: new Date().toISOString(),
    })
    .eq("place_id", placeId)
    .select("id");

  if (error) throw error;

  if (!data?.length) {
    throw new Error(`No business found for place_id ${placeId}`);
  }
}

function upsertManifest(manifest, entry) {
  const { absolute_path: _abs, steps: _steps, ...stored } = entry;
  const existingIndex = manifest.findIndex((e) => e.slug === stored.slug);
  if (existingIndex >= 0) {
    manifest[existingIndex] = stored;
  } else {
    manifest.push(stored);
  }
  return stored;
}

async function processBusiness(business, apiKey, existingEntry) {
  const entry = baseEntry(business, existingEntry);
  const ran = { places: false, cloudinary: false, supabase: false };
  const skipped = { places: false, cloudinary: false, supabase: false };

  let localFile = force ? null : findExistingLocalFile(business.slug, existingEntry);
  if (localFile) {
    entry.local_path = localFile.relativePath;
    if (entry.status !== "no_photos") entry.status = "ok";
  }

  let steps = stepsNeeded(entry, localFile);

  if (dryRun) {
    return {
      ...entry,
      local_path:
        entry.local_path ||
        `(dry-run) photos/batch-${BATCH}/${business.slug}.jpg`,
      cloudinary_url: entry.cloudinary_url || "(dry-run)",
      steps: { would_run: steps },
      error: null,
    };
  }

  // Step 1: Places → local file
  if (steps.places) {
    ran.places = true;
    const downloaded = await downloadFromPlaces(business, apiKey);
    entry.photo_name = downloaded.photo_name;
    entry.local_path = downloaded.local_path;
    entry.author_attributions = downloaded.author_attributions;
    entry.status = downloaded.status;

    if (downloaded.status === "no_photos") {
      entry.cloudinary_url = null;
      entry.cdn_stored = false;
      entry.steps = { ran, skipped };
      return entry;
    }

    localFile = {
      absolutePath: downloaded.absolute_path,
      relativePath: downloaded.local_path,
    };
    // Recompute remaining steps after download
    steps = stepsNeeded(entry, localFile);
  } else if (localFile) {
    skipped.places = true;
  }

  // Step 2: Cloudinary upload
  if (steps.cloudinary) {
    if (!localFile) {
      throw new Error("Cannot upload to Cloudinary without a local file");
    }
    ran.cloudinary = true;
    try {
      entry.cloudinary_url = await uploadToCloudinary(
        localFile.absolutePath,
        business.place_id
      );
      entry.error = null;
      steps = stepsNeeded(entry, localFile);
    } catch (err) {
      entry.cloudinary_url = null;
      entry.cdn_stored = false;
      entry.error = `Cloudinary upload failed: ${err.message}`;
      entry.steps = { ran, skipped };
      return entry;
    }
  } else if (entry.cloudinary_url) {
    skipped.cloudinary = true;
  }

  // Step 3: Supabase cdn_stored
  if (steps.supabase) {
    ran.supabase = true;
    try {
      await markCdnStored(business.place_id);
      entry.cdn_stored = true;
      entry.error = null;
    } catch (dbErr) {
      entry.cdn_stored = false;
      entry.error = `cdn_stored update failed: ${dbErr.message}`;
    }
  } else if (entry.cdn_stored) {
    skipped.supabase = true;
  }

  entry.steps = { ran, skipped };
  return entry;
}

function formatStepSummary(entry) {
  const ran = entry.steps?.ran || {};
  const skipped = entry.steps?.skipped || {};
  const parts = [];
  if (ran.places) parts.push("places:downloaded");
  else if (skipped.places) parts.push("places:skipped");
  if (ran.cloudinary) parts.push("cloudinary:uploaded");
  else if (skipped.cloudinary) parts.push("cloudinary:skipped");
  if (ran.supabase) parts.push("cdn_stored:updated");
  else if (skipped.supabase) parts.push("cdn_stored:skipped");
  return parts.length ? parts.join(", ") : "no-op";
}

async function main() {
  const apiKey = getPlacesApiKey();
  configureCloudinary();
  logSupabaseTarget();

  if (!fs.existsSync(BUSINESSES_FILE)) {
    throw new Error(`Businesses file not found: ${BUSINESSES_FILE}`);
  }

  if (!Number.isFinite(LIMIT) || LIMIT < 1) {
    throw new Error("LIMIT must be an integer >= 1");
  }

  const businesses = loadJson(BUSINESSES_FILE, []);
  const manifestBySlug = loadMergedManifestBySlug();

  const withPlaceId = businesses.filter(
    (b) => b.place_id && String(b.place_id).trim() && b.slug
  );

  const allPending = withPlaceId.filter((b) =>
    needsProcessing(b, manifestBySlug)
  );
  const pending = allPending.slice(0, LIMIT);
  const alreadyComplete = withPlaceId.length - allPending.length;

  if (pending.length === 0) {
    console.log(
      `Businesses with place_id: ${withPlaceId.length} | complete: ${alreadyComplete} | pending: 0\n` +
        "Nothing to process — all steps complete."
    );
    return;
  }

  BATCH = getNextBatchNumber();
  BATCH_DIR = path.join(PHOTOS_DIR, `batch-${BATCH}`);
  PHOTOS_FILE = path.join(BATCH_DIR, "photos.json");
  fs.mkdirSync(BATCH_DIR, { recursive: true });

  const manifest = [];

  console.log(
    `Photos → ${PHOTOS_FILE}\n` +
      (dryRun ? "Mode: DRY RUN\n" : "") +
      (force ? "Mode: FORCE (re-run all steps)\n" : "") +
      `Businesses with place_id: ${withPlaceId.length} | complete: ${alreadyComplete} | ` +
      `pending total: ${allPending.length} | this run: ${pending.length} (LIMIT=${LIMIT}) | ` +
      `output batch-${BATCH}`
  );

  let ok = 0;
  let noPhotos = 0;
  let uploadFailed = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const business = pending[i];
    const label = `[${i + 1}/${pending.length}] ${business.slug}`;
    const existing = manifestBySlug.get(business.slug);

    try {
      const entry = await processBusiness(business, apiKey, existing);
      const stored = upsertManifest(manifest, entry);
      manifestBySlug.set(stored.slug, stored);

      if (dryRun) {
        const would = entry.steps?.would_run || {};
        console.log(
          `🔎 ${label} would run →` +
            ` places:${would.places ? "yes" : "no"}` +
            ` cloudinary:${would.cloudinary ? "yes" : "no"}` +
            ` supabase:${would.supabase ? "yes" : "no"}`
        );
        ok++;
      } else if (entry.status === "ok" && entry.cloudinary_url && entry.cdn_stored) {
        ok++;
        console.log(
          `✅ ${label} → ${formatStepSummary(entry)} → ${entry.cloudinary_url}`
        );
      } else if (entry.status === "ok" && entry.cloudinary_url && !entry.cdn_stored) {
        uploadFailed++;
        console.error(
          `⚠️  ${label} → ${formatStepSummary(entry)} → ${entry.error}`
        );
      } else if (entry.status === "ok" && !entry.cloudinary_url) {
        uploadFailed++;
        console.error(
          `⚠️  ${label} → ${formatStepSummary(entry)} → ${entry.error}`
        );
      } else if (entry.status === "no_photos") {
        noPhotos++;
        console.log(`⚠️  ${label} → no photos (${formatStepSummary(entry)})`);
      }
    } catch (err) {
      failed++;
      const entry = {
        slug: business.slug,
        place_id: business.place_id,
        title: business.title,
        photo_name: null,
        local_path: existing?.local_path ?? null,
        cloudinary_url: existing?.cloudinary_url ?? null,
        cdn_stored: Boolean(existing?.cdn_stored),
        author_attributions: existing?.author_attributions ?? [],
        status: "error",
        error: err.message,
      };
      upsertManifest(manifest, entry);
      console.error(`❌ ${label}: ${err.message}`);
    }

    if (!dryRun) {
      saveJson(PHOTOS_FILE, manifest);
    }

    if (i < pending.length - 1) {
      await sleep(randomDelay());
    }
  }

  console.log(
    `\nDone. ok: ${ok} | no_photos: ${noPhotos} | step_failed: ${uploadFailed} | failed: ${failed} | manifest: ${manifest.length}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
