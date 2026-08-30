const TITLE_TAG_MAX = 60;
const META_DESCRIPTION_MAX = 150;
const LOCAL_NOTE_MAX_WORDS = 25;

const DERIVED_SEO_FIELDS = [
  "highlights",
  "title_tag",
  "meta_description",
  "local_note",
  "keywords",
];

function truncateAtWord(text, maxChars) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxChars) return trimmed;

  const cut = trimmed.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxChars / 2)) {
    return cut.slice(0, lastSpace).trim();
  }
  return cut.trim();
}

function lastCompleteSentence(text) {
  const match = String(text ?? "").match(/^[\s\S]*[.!?]["']?(?=\s|$)/);
  return match ? match[0].trim() : "";
}

function trimHangingGlue(text) {
  return String(text ?? "")
    .replace(
      /(?:\s+(?:and|or|but|the|a|an|of|for|from|with|to|in|on|at|by|over|beyond))+$/i,
      ""
    )
    .trim();
}

function truncateAtSentenceThenWord(text, maxChars) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxChars) return trimmed;

  const cut = trimHangingGlue(truncateAtWord(trimmed, maxChars));
  return lastCompleteSentence(cut) || cut;
}

function limitWordsPreferSentences(text, maxWords) {
  const limited = limitWords(text, maxWords);
  if (!limited) return "";
  if (/[.!?]["']?$/.test(limited)) return limited;
  return lastCompleteSentence(limited) || limited;
}

function limitWords(text, maxWords) {
  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ");
}

function firstSentences(text, count) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (!parts.length) return trimmed;
  return parts.slice(0, count).join(" ");
}

/**
 * Amenity + rating chips stored on businesses.highlights.
 * `features` may be a nested features object or a flat listing row.
 */
export function buildHighlights({
  features = {},
  total_score,
  reviews_count,
} = {}) {
  const flags = features && typeof features === "object" ? features : {};
  const highlights = [];

  if (flags.wheelchair_accessible) highlights.push("Wheelchair Accessible");
  if (flags.credit_cards) highlights.push("Credit Cards Accepted");
  if (flags.debit_cards) highlights.push("Debit Cards Accepted");
  if (flags.nfc_mobile_payments) highlights.push("NFC Mobile Payments");
  if (flags.onsite_services) highlights.push("Onsite Services");
  if (flags.oil_change) highlights.push("Oil Change");
  if (flags.mechanic) highlights.push("On-site Mechanic");
  if (flags.restroom) highlights.push("Restroom Available");
  if (flags.appointments_recommended) {
    highlights.push("Appointments Recommended");
  }

  const score = Number(total_score);
  if (score === 5) {
    highlights.push("Perfect 5-Star Rating");
  } else if (score >= 4.5) {
    highlights.push(`${score}-Star Rating`);
  }

  const reviews = Number(reviews_count);
  if (reviews >= 100) {
    highlights.push(`${reviews}+ Customer Reviews`);
  }

  return highlights;
}

export function buildTitleTag({ title, categoryName, cityName } = {}) {
  const name = String(title ?? "").trim();
  if (!name) return "";

  const category = String(categoryName ?? "").trim();
  const city = String(cityName ?? "").trim();
  if (!category || !city) {
    return truncateAtWord(name, TITLE_TAG_MAX);
  }

  return truncateAtWord(`${name} | ${category} in ${city}`, TITLE_TAG_MAX);
}

export function buildMetaDescription({
  description,
  title,
  categoryName,
  cityName,
  stateName,
  total_score,
  reviews_count,
} = {}) {
  const about = String(description ?? "").trim();
  if (about) {
    return truncateAtSentenceThenWord(about, META_DESCRIPTION_MAX);
  }

  const name = String(title ?? "").trim();
  const category = String(categoryName ?? "").trim();
  const city = String(cityName ?? "").trim();
  const state = String(stateName ?? "").trim();
  const location = [city, state].filter(Boolean).join(", ");

  const parts = [];
  if (name && location && category) {
    parts.push(`${name} in ${location} offers ${category}.`);
  } else if (name && location) {
    parts.push(`${name} in ${location}.`);
  } else if (name) {
    parts.push(name);
  }

  const score = Number(total_score);
  const reviews = Number(reviews_count);
  if (reviews > 0 && Number.isFinite(score) && score > 0) {
    parts.push(`Rated ${score} from ${reviews} reviews.`);
  }

  return truncateAtWord(parts.join(" "), META_DESCRIPTION_MAX);
}

export function buildLocalNote({
  description,
  categoryName,
  cityName,
} = {}) {
  const about = String(description ?? "").trim();
  if (about) {
    return limitWordsPreferSentences(
      firstSentences(about, 2) || about,
      LOCAL_NOTE_MAX_WORDS
    );
  }

  const category = String(categoryName ?? "").trim();
  const city = String(cityName ?? "").trim();
  if (category && city) {
    return `Trusted ${category} in ${city}.`;
  }
  if (city) {
    return `Trusted shop in ${city}.`;
  }
  return "";
}

export function buildKeywords({
  categoryName,
  secondaryNames = [],
  cityName,
} = {}) {
  const items = [
    categoryName,
    ...(Array.isArray(secondaryNames) ? secondaryNames : []),
    cityName,
    "radiator repair",
    "auto repair",
  ];

  const seen = new Set();
  const keywords = [];
  for (const item of items) {
    const value = String(item ?? "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(value);
  }
  return keywords;
}

function listingCategoryName(business) {
  return business?.primary_category?.name ?? "";
}

function listingCityName(business) {
  return business?.city?.name ?? "";
}

function listingStateName(business) {
  return business?.state?.name ?? "";
}

function listingSecondaryNames(business) {
  if (!Array.isArray(business?.secondary_categories)) return [];
  return business.secondary_categories
    .map((item) => item?.name)
    .filter(Boolean);
}

/**
 * Build a subset of derived SEO columns from a full listing row.
 * @param {object} business
 * @param {{ fields?: string[] }} options
 */
export function buildDerivedListingSeo(business = {}, { fields = [] } = {}) {
  const requested = fields.filter((field) => DERIVED_SEO_FIELDS.includes(field));
  const result = {};
  const categoryName = listingCategoryName(business);
  const cityName = listingCityName(business);
  const stateName = listingStateName(business);
  const secondaryNames = listingSecondaryNames(business);
  const features = business.features ?? {};

  for (const field of requested) {
    if (field === "highlights") {
      result.highlights = buildHighlights({
        features,
        total_score: business.total_score,
        reviews_count: business.reviews_count,
      });
    } else if (field === "title_tag") {
      result.title_tag = buildTitleTag({
        title: business.title,
        categoryName,
        cityName,
      });
    } else if (field === "meta_description") {
      result.meta_description = buildMetaDescription({
        description: business.description,
        title: business.title,
        categoryName,
        cityName,
        stateName,
        total_score: business.total_score,
        reviews_count: business.reviews_count,
      });
    } else if (field === "local_note") {
      result.local_note = buildLocalNote({
        description: business.description,
        categoryName,
        cityName,
      });
    } else if (field === "keywords") {
      result.keywords = buildKeywords({
        categoryName,
        secondaryNames,
        cityName,
      });
    }
  }

  return result;
}
