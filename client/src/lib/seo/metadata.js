export const SITE_URL = "https://radiatorrepairhub.com";
export const SITE_NAME = "RadiatorRepairHub";

/** Google truncates around 60 characters on desktop SERPs. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 158;

function collapseWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtWord(value, maxChars) {
  const text = collapseWhitespace(value);
  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxChars * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:|-]+$/, "")}…`;
}

/**
 * Builds a SERP-safe title. The brand suffix is only appended when the
 * combined string still fits inside the visible SERP width.
 */
export function composeTitle(headline, { brand = true } = {}) {
  const base = collapseWhitespace(headline);
  if (!base) return SITE_NAME;

  const suffix = ` | ${SITE_NAME}`;
  if (brand && base.length + suffix.length <= TITLE_MAX) {
    return `${base}${suffix}`;
  }

  return truncateAtWord(base, TITLE_MAX);
}

/**
 * Joins sentence-sized fragments, dropping any trailing fragment that would
 * overflow the snippet budget. Prevents Google from showing a description that
 * ends mid-clause, which is what hurts click-through most.
 */
export function composeDescription(...parts) {
  const sentences = parts.map(collapseWhitespace).filter(Boolean);
  if (sentences.length === 0) return "";

  let result = "";
  for (const sentence of sentences) {
    const next = result ? `${result} ${sentence}` : sentence;
    if (next.length > DESCRIPTION_MAX) break;
    result = next;
  }

  return result || truncateAtWord(sentences[0], DESCRIPTION_MAX);
}

const LOWERCASE_TITLE_WORDS = new Set([
  "and",
  "or",
  "of",
  "for",
  "the",
  "a",
  "an",
  "in",
  "on",
  "at",
  "to",
]);

/** Category names are stored sentence-cased; titles need headline casing. */
export function toTitleCase(value) {
  return collapseWhitespace(value)
    .split(" ")
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && LOWERCASE_TITLE_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/assets/logos/logo.png`,
  width: 1200,
  height: 630,
  alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
};

export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
};

export const NOINDEX_NOFOLLOW_ROBOTS = {
  index: false,
  follow: false,
};

export function buildOpenGraph({ title, description, url, images }) {
  return {
    title,
    description,
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    ...(url && { url: `${SITE_URL}${url}` }),
    images: images ?? [DEFAULT_OG_IMAGE],
  };
}

/**
 * Query values that produce the same listings as the bare URL, so they should
 * not be treated as a distinct filtered view. `page` is excluded here because
 * pagination is handled separately and does have a canonical form of its own.
 */
const NEUTRAL_LISTING_PARAMS = {
  page: () => true,
  sort: (value) => String(value).toLowerCase() === "verified",
};

/**
 * True when a listing URL carries sort or filter params.
 *
 * Every filter combination the UI can produce is a crawlable href, which is how
 * URLs like `/state/TX?page=14&sort=most_reviews` ended up indexed and
 * competing with `/state/TX`. Those variants get noindex plus a canonical
 * pointing at the clean path.
 */
export function isFilteredListingUrl(searchParams) {
  if (!searchParams) return false;

  const entries =
    typeof searchParams.entries === "function"
      ? [...searchParams.entries()]
      : Object.entries(searchParams);

  return entries.some(([key, rawValue]) => {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (value == null || value === "") return false;

    const isNeutral = NEUTRAL_LISTING_PARAMS[key];
    return isNeutral ? !isNeutral(value) : true;
  });
}

/**
 * Directory metadata for state, city, and category listings.
 *
 * Page 2+ keeps its own canonical so Google does not treat deep pages as
 * duplicates of page 1, and is marked noindex/follow so crawl equity flows to
 * the listings without competing with the primary landing page. Sorted and
 * filtered views have no canonical form of their own, so they point back at the
 * clean listing path.
 */
export function buildDirectoryMetadata({
  headline,
  description,
  keywords,
  path,
  page = 1,
  searchParams = null,
  indexable = true,
}) {
  const isPaged = Number(page) > 1;
  const isFiltered = isFilteredListingUrl(searchParams);
  const title = composeTitle(
    isPaged ? `${headline} (Page ${page})` : headline
  );
  const canonicalPath =
    isPaged && !isFiltered ? `${path}?page=${page}` : path;

  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
    },
    openGraph: buildOpenGraph({
      title,
      description,
      url: canonicalPath,
    }),
    robots:
      !indexable || isPaged || isFiltered ? NOINDEX_ROBOTS : INDEX_ROBOTS,
  };
}

export function buildPageMetadata({
  title,
  description,
  keywords,
  path,
  openGraph,
  robots = INDEX_ROBOTS,
}) {
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: path ? `${SITE_URL}${path}` : SITE_URL,
    },
    openGraph: openGraph ?? buildOpenGraph({ title, description, url: path }),
    robots,
  };
}

export const NOT_FOUND_METADATA = buildPageMetadata({
  title: "Page Not Found - RadiatorRepairHub",
  description: "The page you are looking for could not be found.",
  robots: NOINDEX_ROBOTS,
});

export const MAINTENANCE_METADATA = buildPageMetadata({
  title: "Maintenance - RadiatorRepairHub",
  description: "RadiatorRepairHub is temporarily undergoing scheduled maintenance.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
});
