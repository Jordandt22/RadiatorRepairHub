import { SITE_URL } from "@/lib/seo/metadata";
import { getBusinessDisplayImage } from "@/lib/images";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * schema.org LocalBusiness subtypes Google recognises for this directory.
 * Falls back to AutoRepair, which covers radiator and cooling system shops.
 */
const CATEGORY_SCHEMA_TYPES = {
  "auto-repair-shop": "AutoRepair",
  "radiator-repair-service": "AutoRepair",
  "auto-body-shop": "AutoBodyShop",
  "car-repair-and-maintenance-service": "AutoRepair",
  "truck-repair-shop": "AutoRepair",
  "auto-parts-store": "AutoPartsStore",
};

function text(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function positiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Recursively removes null/undefined so JSON-LD never emits empty properties. */
function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((item) => item != null);
    return items.length > 0 ? items : null;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)])
      .filter(([, item]) => item != null);
    return entries.length > 0 ? Object.fromEntries(entries) : null;
  }

  if (typeof value === "string") return text(value);

  return value ?? null;
}

export function getBusinessUrl(slug) {
  return `${SITE_URL}/business/${slug}`;
}

function buildOpeningHours(hours) {
  if (!Array.isArray(hours)) return null;

  return hours.flatMap((day) => {
    if (!day || day.is_closed || !Array.isArray(day.hours)) return [];
    const dayOfWeek = text(day.day_of_week);
    if (!dayOfWeek) return [];

    return day.hours
      .filter((slot) => text(slot?.open) && text(slot?.close))
      .map((slot) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dayOfWeek}`,
        opens: slot.open,
        closes: slot.close,
      }));
  });
}

function buildServiceCatalog(business) {
  const services = [
    business?.primary_category?.name,
    ...(Array.isArray(business?.secondary_categories)
      ? business.secondary_categories.map((category) => category?.name)
      : []),
  ]
    .map(text)
    .filter(Boolean);

  const unique = [...new Set(services.length > 0 ? services : ["Radiator Repair"])];

  return {
    "@type": "OfferCatalog",
    name: "Automotive repair services",
    itemListElement: unique.map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
        serviceType: name,
      },
    })),
  };
}

/**
 * LocalBusiness node for a listing page.
 *
 * Ratings are only emitted when the listing actually has review data, and
 * geo-dependent nodes are dropped when coordinates are missing, so the markup
 * stays valid for sparse listings.
 */
export function buildBusinessSchema(business, slug) {
  if (!business) return null;

  const pageUrl = getBusinessUrl(slug);
  const latitude = Number(business.latitude);
  const longitude = Number(business.longitude);
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const ratingValue = positiveNumber(business.total_score);
  const reviewCount = positiveNumber(business.reviews_count);
  const image = getBusinessDisplayImage(business);
  const website = text(business.website);
  const schemaType =
    CATEGORY_SCHEMA_TYPES[business.primary_category?.slug] || "AutoRepair";

  const openingHours = buildOpeningHours(business.hours);

  return compact({
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${pageUrl}#business`,
    name: text(business.title),
    alternateName: text(business.title_tag),
    description: text(business.meta_description) || text(business.description),
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    sameAs: website ? [website] : null,
    telephone: text(business.phone),
    image: image || null,
    priceRange: "$$",
    currenciesAccepted: "USD",
    address: {
      "@type": "PostalAddress",
      streetAddress: text(business.address),
      addressLocality: text(business.city?.name),
      addressRegion: text(business.state?.code) || text(business.state?.name),
      postalCode: text(business.postal_code?.code),
      addressCountry: "US",
    },
    geo: hasCoordinates
      ? {
          "@type": "GeoCoordinates",
          latitude,
          longitude,
        }
      : null,
    areaServed: business.city?.name
      ? {
          "@type": "City",
          name: text(business.city.name),
          containedInPlace: business.state?.name
            ? {
                "@type": "State",
                name: text(business.state.name),
              }
            : null,
        }
      : null,
    aggregateRating:
      ratingValue && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount: Math.round(reviewCount),
            bestRating: 5,
            worstRating: 1,
          }
        : null,
    openingHoursSpecification:
      openingHours && openingHours.length > 0 ? openingHours : null,
    amenityFeature: Array.isArray(business.highlights)
      ? business.highlights.filter(Boolean).map((highlight) => ({
          "@type": "LocationFeatureSpecification",
          name: highlight,
          value: true,
        }))
      : null,
    hasOfferCatalog: buildServiceCatalog(business),
    knowsAbout: Array.isArray(business.keywords)
      ? business.keywords.filter(Boolean)
      : null,
    parentOrganization: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

/**
 * ItemList of the listings rendered on a directory page. Gives Google an
 * explicit map of which businesses a state/city/category page surfaces.
 */
export function buildListingsItemList({
  businesses = [],
  url,
  name,
  page = 1,
  pageSize = 12,
}) {
  const items = (Array.isArray(businesses) ? businesses : [])
    .filter((business) => business?.slug)
    .map((business, index) => ({
      "@type": "ListItem",
      position: (Math.max(1, Number(page) || 1) - 1) * pageSize + index + 1,
      url: getBusinessUrl(business.slug),
      name: text(business.title),
    }));

  if (items.length === 0) return null;

  return compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items,
  });
}

/** CollectionPage node for state, city, and category directory pages. */
export function buildDirectoryCollectionSchema({
  name,
  description,
  url,
  areaServed,
  totalBusinesses,
}) {
  return compact({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@id": WEBSITE_ID },
    about: {
      "@type": "Service",
      serviceType: "Radiator Repair",
      provider: { "@id": ORGANIZATION_ID },
      areaServed: areaServed || null,
    },
    mainEntity: positiveNumber(totalBusinesses)
      ? {
          "@type": "ItemList",
          numberOfItems: Math.round(Number(totalBusinesses)),
        }
      : null,
  });
}
