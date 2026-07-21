import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSupabaseClient, logSupabaseTarget } from "./supabaseClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "..");

// "custom" → emails/batch-{BATCH}/emails.json
// "firecrawl" → emails/firecrawl/batch-{BATCH}/emails.json
const SOURCE = "firecrawl"; // "custom" | "firecrawl"
const BATCH = 3; // ! Finished Batch 3

const EMAILS_FILE =
  SOURCE === "firecrawl"
    ? path.join(
      SRC_ROOT,
      "emails",
      "firecrawl",
      `batch-${BATCH}`,
      "emails.json"
    )
    : path.join(SRC_ROOT, "emails", `batch-${BATCH}`, "emails.json");

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

const supabase = createSupabaseClient();

function loadEmails() {
  if (!fs.existsSync(EMAILS_FILE)) {
    throw new Error(`Emails file not found: ${EMAILS_FILE}`);
  }
  const raw = fs.readFileSync(EMAILS_FILE, "utf-8").trim();
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${path.basename(EMAILS_FILE)} must be an array`);
  }
  return data;
}

async function fetchBusinessBySlug(slug) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, email, title")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function updateEmail(id, email) {
  const { error } = await supabase
    .from("businesses")
    .update({ email, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

async function main() {
  if (SOURCE !== "custom" && SOURCE !== "firecrawl") {
    throw new Error('SOURCE must be "custom" or "firecrawl"');
  }

  logSupabaseTarget();

  if (dryRun) {
    console.log("Dry run — no rows will be written\n");
  }
  if (force) {
    console.log("Force mode — overwriting existing emails\n");
  }

  console.log(`Reading ${EMAILS_FILE}\n`);

  const entries = loadEmails().filter(
    (e) => e?.slug && e?.email && String(e.email).trim()
  );

  const labelPath =
    SOURCE === "firecrawl"
      ? `firecrawl/batch-${BATCH}/emails.json`
      : `batch-${BATCH}/emails.json`;

  console.log(`Loaded ${entries.length} emails from ${labelPath}\n`);

  let updated = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const entry of entries) {
    const slug = entry.slug;
    const email = String(entry.email).trim().toLowerCase();
    const label = slug;

    try {
      const business = await fetchBusinessBySlug(slug);

      if (!business) {
        missing++;
        console.log(`❓ ${label} — not found in businesses`);
        continue;
      }

      const existing = business.email ? String(business.email).trim() : "";

      if (existing && !force) {
        skipped++;
        console.log(
          `⏭️  ${label} — already has email (${existing}), use --force to overwrite`
        );
        continue;
      }

      if (existing.toLowerCase() === email) {
        skipped++;
        console.log(`⏭️  ${label} — already up to date`);
        continue;
      }

      if (dryRun) {
        updated++;
        console.log(`🔎 ${label} — would set ${email}`);
        continue;
      }

      await updateEmail(business.id, email);
      updated++;
      console.log(`✅ ${label} → ${email}`);
    } catch (err) {
      failed++;
      console.error(`❌ ${label}: ${err?.message || String(err)}`);
    }
  }

  console.log(
    `\nDone. updated: ${updated} | skipped: ${skipped} | missing: ${missing} | failed: ${failed}`
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
