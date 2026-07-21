import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import {
  createSupabaseClient,
  getSupabaseTarget,
  logSupabaseTarget,
} from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");
const EMAILS_DIR = path.join(SRC_ROOT, "emails");
const FIRECRAWL_DIR = path.join(EMAILS_DIR, "firecrawl");

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

const target = getSupabaseTarget();
const supabase = createSupabaseClient();
const devSupabase =
  target === "prod" ? createDevSupabaseClient() : null;

function createDevSupabaseClient() {
  const url = process.env.DEV_SUPABASE_URL;
  const key = process.env.DEV_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Prod sync needs DEV_SUPABASE_URL and DEV_SUPABASE_KEY in .env for place_id fallback when slugs differ."
    );
  }

  return createClient(url, key);
}

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return fallback;
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${path.basename(filePath)} must be an array`);
  }
  return data;
}

function listCustomBatchFiles() {
  if (!fs.existsSync(EMAILS_DIR)) return [];

  return fs
    .readdirSync(EMAILS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^batch-\d+$/.test(d.name))
    .map((d) => ({
      label: d.name,
      source: "custom",
      file: path.join(EMAILS_DIR, d.name, "emails.json"),
    }))
    .filter((b) => fs.existsSync(b.file))
    .sort(
      (a, b) =>
        Number(a.label.replace("batch-", "")) -
        Number(b.label.replace("batch-", ""))
    );
}

function listFirecrawlBatchFiles() {
  if (!fs.existsSync(FIRECRAWL_DIR)) return [];

  return fs
    .readdirSync(FIRECRAWL_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^batch-\d+$/.test(d.name))
    .map((d) => ({
      label: `firecrawl/${d.name}`,
      source: "firecrawl",
      file: path.join(FIRECRAWL_DIR, d.name, "emails.json"),
    }))
    .filter((b) => fs.existsSync(b.file))
    .sort(
      (a, b) =>
        Number(a.label.replace("firecrawl/batch-", "")) -
        Number(b.label.replace("firecrawl/batch-", ""))
    );
}

/**
 * Load every batch file. Custom batches apply first; later firecrawl batches
 * override the same slug (matches scrape → need-firecrawl → firecrawl flow).
 */
function loadAllEmails() {
  const batchFiles = [...listCustomBatchFiles(), ...listFirecrawlBatchFiles()];

  if (batchFiles.length === 0) {
    throw new Error(
      `No batch emails.json files found under ${EMAILS_DIR} or ${FIRECRAWL_DIR}`
    );
  }

  const bySlug = new Map();
  const fileStats = [];

  for (const { label, source, file } of batchFiles) {
    const entries = loadJson(file, []);
    let accepted = 0;

    for (const entry of entries) {
      const slug = entry?.slug;
      const email = entry?.email ? String(entry.email).trim().toLowerCase() : "";
      if (!slug || !email) continue;

      accepted++;
      bySlug.set(slug, { slug, email, source, batch: label });
    }

    fileStats.push({ label, source, total: entries.length, accepted });
  }

  return { entries: [...bySlug.values()], batchFiles, fileStats };
}

async function fetchBusinessBySlug(client, slug) {
  const { data, error } = await client
    .from("businesses")
    .select("id, slug, email, title, place_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function fetchBusinessByPlaceId(placeId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, email, title, place_id")
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Batch files use dev slugs. On prod, the same business may exist under a
 * different slug — resolve via dev place_id when a direct slug lookup fails.
 */
async function resolveBusiness(slug) {
  const business = await fetchBusinessBySlug(supabase, slug);
  if (business) {
    return { business, matchedBy: "slug" };
  }

  if (!devSupabase) {
    return null;
  }

  const devBusiness = await fetchBusinessBySlug(devSupabase, slug);
  if (!devBusiness?.place_id) {
    return null;
  }

  const prodBusiness = await fetchBusinessByPlaceId(devBusiness.place_id);
  if (!prodBusiness) {
    return null;
  }

  return { business: prodBusiness, matchedBy: "place_id" };
}

async function updateEmail(id, email) {
  const { error } = await supabase
    .from("businesses")
    .update({ email, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

async function main() {
  logSupabaseTarget();

  if (dryRun) {
    console.log("Dry run — no rows will be written\n");
  }
  if (force) {
    console.log("Force mode — overwriting existing emails\n");
  }
  if (target === "prod") {
    console.log("Prod mode — will fall back to place_id via dev when slug differs\n");
  }

  const { entries, fileStats } = loadAllEmails();

  console.log("Batch files:");
  for (const { label, source, total, accepted } of fileStats) {
    console.log(`  • ${label} (${source}): ${accepted}/${total} usable emails`);
  }
  console.log(`\nUnique slugs to sync: ${entries.length}\n`);

  let updated = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;
  let matchedViaPlaceId = 0;

  for (const entry of entries) {
    const { slug, email } = entry;
    const label = slug;

    try {
      const resolved = await resolveBusiness(slug);

      if (!resolved) {
        missing++;
        console.log(`❓ ${label} — not found in businesses`);
        continue;
      }

      const { business, matchedBy } = resolved;
      const matchNote =
        matchedBy === "place_id"
          ? ` (matched prod slug ${business.slug} via place_id)`
          : "";

      if (matchedBy === "place_id") {
        matchedViaPlaceId++;
      }

      const existing = business.email ? String(business.email).trim() : "";

      if (existing && !force) {
        skipped++;
        console.log(
          `⏭️  ${label} — already has email (${existing})${matchNote}, use --force to overwrite`
        );
        continue;
      }

      if (existing.toLowerCase() === email) {
        skipped++;
        console.log(`⏭️  ${label} — already up to date${matchNote}`);
        continue;
      }

      if (dryRun) {
        updated++;
        console.log(
          `🔎 ${label} — would set ${email} (from ${entry.batch})${matchNote}`
        );
        continue;
      }

      await updateEmail(business.id, email);
      updated++;
      console.log(`✅ ${label} → ${email} (${entry.batch})${matchNote}`);
    } catch (err) {
      failed++;
      console.error(`❌ ${label}: ${err?.message || String(err)}`);
    }
  }

  console.log(
    `\nDone. updated: ${updated} | skipped: ${skipped} | missing: ${missing} | matched via place_id: ${matchedViaPlaceId} | failed: ${failed}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
