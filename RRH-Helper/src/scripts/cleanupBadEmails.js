import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getJunkReason } from "./emailFilters.js";
import { createSupabaseClient, logSupabaseTarget } from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");
const EMAILS_DIR = path.join(SRC_ROOT, "emails");
const NEED_FIRECRAWL_FILE = path.join(EMAILS_DIR, "need-firecrawl.json");
const FIRECRAWL_DIR = path.join(EMAILS_DIR, "firecrawl");

const dryRun = process.argv.includes("--dry-run");

const supabase = createSupabaseClient();

function loadJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

async function clearEmailBySlug(slug) {
  const { data, error: lookupError } = await supabase
    .from("businesses")
    .select("id, email")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (!data) return { status: "missing" };
  if (data.email == null || data.email === "") {
    return { status: "already_null" };
  }

  if (dryRun) return { status: "would_clear", previous: data.email };

  const { error } = await supabase
    .from("businesses")
    .update({ email: null, updated_at: new Date().toISOString() })
    .eq("id", data.id);

  if (error) throw error;
  return { status: "cleared", previous: data.email };
}

async function main() {
  logSupabaseTarget();

  if (dryRun) {
    console.log("Dry run — no files or DB rows will be written\n");
  }

  const batchFiles = [...listCustomBatchFiles(), ...listFirecrawlBatchFiles()];
  if (batchFiles.length === 0) {
    console.log("No batch emails.json files found.");
    return;
  }

  const needFirecrawl = loadJson(NEED_FIRECRAWL_FILE, []);
  const needFirecrawlSlugs = new Set(
    needFirecrawl.map((e) => e.slug).filter(Boolean)
  );

  // Firecrawl junk is removed so the next scrape can retry with better filters
  // (do not add to still-need, which would skip them).

  let removed = 0;
  let moved = 0;
  let cleared = 0;
  let alreadyNull = 0;
  let missing = 0;
  let failed = 0;
  let firecrawlRemoved = 0;

  for (const { label, source, file } of batchFiles) {
    const entries = loadJson(file, []);
    if (!Array.isArray(entries)) {
      console.error(`❌ ${label}/emails.json is not an array — skipped`);
      continue;
    }

    const keep = [];
    const bad = [];

    for (const entry of entries) {
      const reason = getJunkReason(entry?.email);
      if (reason) {
        bad.push({ entry, reason });
      } else {
        keep.push(entry);
      }
    }

    console.log(
      `\n${label}: ${entries.length} emails → keep ${keep.length}, remove ${bad.length}`
    );

    if (bad.length === 0) continue;

    for (const { entry, reason } of bad) {
      removed++;
      if (source === "firecrawl") firecrawlRemoved++;
      const slugLabel = entry.slug || "(no-slug)";
      console.log(`  🗑️  ${slugLabel} — ${entry.email} (${reason})`);

      if (source === "custom" && entry.slug && !needFirecrawlSlugs.has(entry.slug)) {
        needFirecrawl.push({
          slug: entry.slug,
          website: entry.website || "",
          reason: "bad_email_rejected",
          pages_scraped: entry.pages_scraped || [],
          error: `${reason}: ${entry.email}`,
        });
        needFirecrawlSlugs.add(entry.slug);
        moved++;
      }

      try {
        const result = await clearEmailBySlug(entry.slug);
        if (result.status === "cleared" || result.status === "would_clear") {
          cleared++;
        } else if (result.status === "already_null") {
          alreadyNull++;
        } else if (result.status === "missing") {
          missing++;
          console.log(`     ❓ not found in Supabase`);
        }
      } catch (err) {
        failed++;
        console.error(`     ❌ Supabase: ${err.message}`);
      }
    }

    if (!dryRun) {
      saveJson(file, keep);
    }
  }

  if (!dryRun) {
    saveJson(NEED_FIRECRAWL_FILE, needFirecrawl);
  }

  console.log(
    `\nDone. removed from batches: ${removed} (firecrawl: ${firecrawlRemoved}) | added to need-firecrawl: ${moved} | supabase cleared: ${cleared} | already null: ${alreadyNull} | missing: ${missing} | failed: ${failed}`
  );
  console.log(
    `need-firecrawl total: ${needFirecrawl.length}` +
      (firecrawlRemoved
        ? ` | firecrawl junk removed (eligible for retry on next scrape)`
        : "")
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
