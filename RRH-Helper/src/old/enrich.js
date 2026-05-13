import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { Parser } from "json2csv";
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// -----------------------------
// Build Claude Prompt
// -----------------------------
function buildPrompt(business) {
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
- Additional Categories: ${business.categories?.join(", ")}
- Address: ${business.address}
- Phone: ${business.phone}
- Rating: ${business.totalScore} stars from ${business.reviewsCount} reviews
- Opening Hours: ${JSON.stringify(business.openingHours)}
- Location: lat ${business.location.lat}, lng ${business.location.lng}
- Additional Info: ${JSON.stringify(business.additionalInfo)}
- Image URL: ${business.imageUrl}
- Page URL: ${business.url}

Output ONLY valid JSON with keys: description, serviceTags, titleTag, metaDescription, localNote, localBusinessSchema.
  `;
}

// -----------------------------
// Clean Claude output
// -----------------------------
function cleanJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// -----------------------------
// Enrich a batch of businesses
// -----------------------------
async function enrichBatch(businesses) {
  const results = [];

  for (const business of businesses) {
    const prompt = buildPrompt(business);

    try {
      const response = await client.messages.create({
        model: process.env.CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response?.content?.[0]?.text || "";
      const cleaned = cleanJSON(raw);

      const enriched = JSON.parse(cleaned);
      results.push({ ...business, enriched });
      console.log(`✅ Enriched: ${business.title}`);
    } catch (err) {
      console.error(`❌ Failed for ${business.title}:`, err.message);
    }
  }

  return results;
}

// -----------------------------
// Convert JSON to CSV
// -----------------------------
function saveCSV(data, filename) {
  try {
    const parser = new Parser({ flatten: true });
    const csv = parser.parse(data);
    fs.writeFileSync(filename, csv);
    console.log(`✅ CSV saved: ${filename}`);
  } catch (err) {
    console.error("❌ Failed to save CSV:", err.message);
  }
}

// -----------------------------
// Main function
// -----------------------------
async function main() {
  const rawData = fs.readFileSync("./src/start/businesses.json", "utf-8");
  const businesses = JSON.parse(rawData);

  const batchSize = 5; // adjust if needed to avoid rate limits
  let allEnriched = [];

  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}...`);
    const enriched = await enrichBatch(batch);
    allEnriched = allEnriched.concat(enriched);

    // Format Data
    allEnriched = allEnriched.map(flattenBusiness);

    // Optional: save intermediate results in case of errors
    fs.writeFileSync(
      "./src/enriched/enriched_partial.json",
      JSON.stringify(allEnriched, null, 2)
    );
  }

  fs.writeFileSync(
    "./src/enriched/enriched.json",
    JSON.stringify(allEnriched, null, 2)
  );
  console.log("✅ Full enrichment complete. Saved to enriched.json");

  saveCSV(allEnriched, "./src/enriched/enriched.csv");
}

main().catch(console.error);
