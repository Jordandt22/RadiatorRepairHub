import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { FLOW_PATHS, ensureFlowDirs } from "./flowPaths.js";

dotenv.config();

ensureFlowDirs();

const FILTERED_FILE = FLOW_PATHS.filtered;
const ENRICHED_FILE = FLOW_PATHS.enriched;
const ENRICH_DIR = path.dirname(ENRICHED_FILE);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
const BATCH_SIZE = Number(process.env.ENRICH_BATCH_SIZE) || 5;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveEnrichedJson(businesses) {
  fs.mkdirSync(ENRICH_DIR, { recursive: true });
  fs.writeFileSync(ENRICHED_FILE, JSON.stringify(businesses, null, 2));
}

function mergeWithExistingEnrichment(filtered, existing = []) {
  const enrichedByPlaceId = new Map(
    existing.filter((b) => b.placeId).map((b) => [b.placeId, b])
  );

  return filtered.map((business) => {
    const existingBiz = business.placeId
      ? enrichedByPlaceId.get(business.placeId)
      : null;

    if (existingBiz?.enriched?.description) {
      return { ...business, enriched: existingBiz.enriched };
    }

    return business;
  });
}

function prepareEnrichedFile() {
  if (!fs.existsSync(FILTERED_FILE)) {
    throw new Error(
      `Filtered file not found: ${FILTERED_FILE}. Run "npm run filter" first.`
    );
  }

  const filtered = loadJson(FILTERED_FILE);
  const isNewFile = !fs.existsSync(ENRICHED_FILE);
  const existing = isNewFile ? [] : loadJson(ENRICHED_FILE);
  const merged = mergeWithExistingEnrichment(filtered, existing);

  saveEnrichedJson(merged);

  if (isNewFile) {
    console.log(
      `📄 Created enriched.json from filter/start.json (${merged.length} businesses)`
    );
  } else {
    console.log(`📋 Synced enriched.json with filter/start.json (${merged.length} businesses)`);
  }

  return merged;
}

function buildPrompt(business) {
  const lat = business.location?.lat ?? "unknown";
  const lng = business.location?.lng ?? "unknown";

  return `
You are an expert content writer and SEO specialist creating enriched listings for a local radiator/auto repair directory.

Using the information below, generate a **JSON object** with these keys:

1. **description** – 50–90 words, conversational, warm, and engaging. Highlight services, city/neighborhood, trust signals (rating, reviews, family-owned), and amenities (on-site mechanic, wheelchair accessibility, payment options). Limit business name repetition. Include 1–2 service keywords naturally.

2. **serviceTags** – array of 5 relevant services/categories/amenities, in title case, suitable for filtering/search.

3. **titleTag** – SEO title (≤ 60 characters) including business name, primary category, and city/neighborhood.

4. **metaDescription** – SEO meta description (≤ 150 characters) summarizing services, rating, and location. Clear and natural language.

5. **localNote** – 1–2 concise sentences (≤ 25 words) emphasizing local trust, community connection, or unique selling points.

6. **localBusinessSchema** – generate a complete **LocalBusiness JSON-LD object** following schema.org. Include:
   - @context, @type, @id
   - name, image, url, telephone
   - address (streetAddress, addressLocality, addressRegion, postalCode, addressCountry)
   - geo coordinates (latitude, longitude)
   - aggregateRating (ratingValue, reviewCount)
   - openingHoursSpecification (include only open days)
   - priceRange if known
   - keywords derived from serviceTags including location-based SEO terms

Business Info:
- Name: ${business.title}
- Primary Category: ${business.categoryName}
- Additional Categories: ${business.categories?.join(", ") || ""}
- Address: ${business.address}
- Phone: ${business.phone}
- Rating: ${business.totalScore} stars from ${business.reviewsCount} reviews
- Opening Hours: ${JSON.stringify(business.openingHours)}
- Location: lat ${lat}, lng ${lng}
- Additional Info: ${JSON.stringify(business.additionalInfo)}
- Image URL: ${business.imageUrl}
- Page URL: ${business.url}

Output ONLY valid JSON with keys: description, serviceTags, titleTag, metaDescription, localNote, localBusinessSchema.
  `;
}

function cleanJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function isEnriched(business) {
  return Boolean(business.enriched?.description);
}

async function enrichOne(business) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: buildPrompt(business) }],
  });

  const raw = response?.content?.[0]?.text || "";
  const enriched = JSON.parse(cleanJSON(raw));
  return { ...business, enriched };
}

export async function enrichBusinesses() {
  const businesses = prepareEnrichedFile();
  const pending = businesses.filter((b) => !isEnriched(b));

  if (pending.length === 0) {
    console.log("✅ All businesses already enriched");
    return businesses;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in .env");
  }

  console.log(
    `Enriching ${pending.length} of ${businesses.length} businesses (batch size: ${BATCH_SIZE})`
  );

  let enrichedCount = 0;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pending.length / BATCH_SIZE);
    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    for (const business of batch) {
      try {
        const enriched = await enrichOne(business);
        const index = businesses.findIndex(
          (b) => b.placeId === business.placeId
        );
        if (index !== -1) {
          businesses[index] = enriched;
        }
        enrichedCount++;
        console.log(`✅ Enriched: ${business.title}`);
      } catch (err) {
        console.error(`❌ Failed for ${business.title}:`, err.message);
      }
    }

    saveEnrichedJson(businesses);
    console.log(`💾 Progress saved (${enrichedCount}/${pending.length})`);
  }

  console.log(`✅ Enrichment complete → ${ENRICHED_FILE}`);
  return businesses;
}

enrichBusinesses().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
