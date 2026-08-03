import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";

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

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

async function enrichOne(client, business) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: buildPrompt(business) }],
  });

  const raw = response?.content?.[0]?.text || "";
  const enriched = JSON.parse(cleanJSON(raw));
  if (!enriched?.description) {
    throw new Error("Enrichment missing description");
  }
  return { ...business, enriched };
}

/**
 * Enrich businesses; soft-fail per item.
 * @param {object[]} businesses
 * @returns {Promise<{ succeeded: object[], failed: object[] }>}
 */
export async function enrichBusinesses(businesses) {
  if (!Array.isArray(businesses)) {
    throw new Error("Enrich payload must be an array");
  }

  const client = getClient();
  const succeeded = [];
  const failed = [];

  for (const business of businesses) {
    if (business?.enriched?.description) {
      succeeded.push(business);
      continue;
    }

    try {
      succeeded.push(await enrichOne(client, business));
    } catch (err) {
      failed.push({
        title: business?.title ?? null,
        placeId: business?.placeId ?? null,
        business,
        error: err?.message || "Enrichment failed",
      });
    }
  }

  return { succeeded, failed };
}
