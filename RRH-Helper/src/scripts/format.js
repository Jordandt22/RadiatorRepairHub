import fs from "fs";

const hasTrue = (arr, label) =>
  Array.isArray(arr) && arr.some((item) => item[label]);

function toBoolString(val) {
  if (val === "TRUE" || val === "FALSE") return val;
  return val ? "TRUE" : "FALSE";
}

function normalizeCid(cid) {
  if (cid == null || cid === "") return cid;
  const num = Number(cid);
  return Number.isNaN(num) ? cid : num;
}

function normalizeReviewsDistribution(dist) {
  if (dist == null || dist === "") return "";
  if (typeof dist === "object" && Object.keys(dist).length === 0) return "";
  return dist;
}

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.map((k) => String(k).trim()).filter(Boolean);
  }
  if (typeof keywords === "string" && keywords.trim()) {
    return keywords.split(",").map((k) => k.trim()).filter(Boolean);
  }
  return [];
}

function buildHighlights(biz) {
  const highlights = [];

  if (biz.wheelchair_accessible) highlights.push("Wheelchair Accessible");
  if (biz.credit_cards) highlights.push("Credit Cards Accepted");
  if (biz.debit_cards) highlights.push("Debit Cards Accepted");
  if (biz.nfc_mobile_payments) highlights.push("NFC Mobile Payments");
  if (biz.onsite_services) highlights.push("Onsite Services");
  if (biz.oil_change) highlights.push("Oil Change");
  if (biz.mechanic) highlights.push("On-site Mechanic");
  if (biz.restroom) highlights.push("Restroom Available");
  if (biz.appointments_recommended) highlights.push("Appointments Recommended");

  if (biz.total_score === 5) {
    highlights.push("Perfect 5-Star Rating");
  } else if (biz.total_score >= 4.5) {
    highlights.push(`${biz.total_score}-Star Rating`);
  }

  if (biz.reviews_count >= 100) {
    highlights.push(`${biz.reviews_count}+ Customer Reviews`);
  }

  return highlights;
}

// 🔹 Helper: convert camelCase / PascalCase / etc → snake_case
function toSnakeCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // handle camelCase
    .replace(/[\s\-]+/g, "_") // spaces and dashes → underscore
    .toLowerCase();
}

// 🔹 Recursive function to transform all keys
function keysToSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnakeCase(item));
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnakeCase(key),
        keysToSnakeCase(value),
      ])
    );
  }
  return obj; // primitive → return as-is
}

export function formatBusiness(biz) {
  const bizData = biz.enriched || {};
  const enrichedBiz = {
    ...biz,

    // Location
    latitude: biz.location?.lat || "",
    longitude: biz.location?.lng || "",
    timezone: biz.timezone ?? null,

    // From Additional Fields
    mechanic: false,
    restroom: false,
    credit_cards: false,
    debit_cards: false,
    wheelchair_accessible: false,
    onsite_services: false,
    oil_change: false,
    nfc_mobile_payments: false,
    appointments_recommended: false,

    // Enriched fields
    description: bizData.description || "",
    service_tags: bizData.serviceTags ? bizData.serviceTags.join(", ") : "",
    title_tag: bizData.titleTag || "",
    meta_description: bizData.metaDescription || "",
    local_note: bizData.localNote || "",
    opening_hours_specification:
      bizData.localBusinessSchema?.openingHoursSpecification || null,
    keywords: normalizeKeywords(bizData.localBusinessSchema?.keywords),
    booking_links: Array.isArray(biz.bookingLinks) ? biz.bookingLinks : [],
    owner_updates: Array.isArray(biz.ownerUpdates) ? biz.ownerUpdates : [],
    image_urls: Array.isArray(biz.imageUrls) ? biz.imageUrls : [],
  };

  // Format to Snake Case
  const formattedBiz = keysToSnakeCase(enrichedBiz);

  // Delete Fields
  delete formattedBiz.enriched;
  delete formattedBiz.flagged;
  delete formattedBiz.price;
  delete formattedBiz.location;
  delete formattedBiz.claim_this_business;
  delete formattedBiz.google_food_url;
  delete formattedBiz.hotel_ads;
  delete formattedBiz.people_also_search;
  delete formattedBiz.places_tags;
  delete formattedBiz.reviews_tags;
  delete formattedBiz.gas_prices;
  delete formattedBiz.additional_opening_hours;
  delete formattedBiz.plus_code;

  // Update Additional Fields
  const info = formattedBiz.additional_info || {};

  // service options
  if (hasTrue(info.service_options, "onsite_services")) {
    formattedBiz.onsite_services = true;
  }

  // accessibility (true if any wheelchair-related key is true)
  if (
    hasTrue(info.accessibility, "wheelchair_accessible_entrance") ||
    hasTrue(info.accessibility, "wheelchair_accessible_parking_lot") ||
    hasTrue(info.accessibility, "wheelchair_accessible_restroom") ||
    hasTrue(info.accessibility, "wheelchair_accessible_seating")
  ) {
    formattedBiz.wheelchair_accessible = true;
  }

  // offerings
  if (hasTrue(info.offerings, "oil_change")) {
    formattedBiz.oil_change = true;
  }

  // amenities
  if (hasTrue(info.amenities, "mechanic")) {
    formattedBiz.mechanic = true;
  }
  if (hasTrue(info.amenities, "restroom")) {
    formattedBiz.restroom = true;
  }

  // payments
  if (hasTrue(info.payments, "credit_cards")) {
    formattedBiz.credit_cards = true;
  }
  if (hasTrue(info.payments, "debit_cards")) {
    formattedBiz.debit_cards = true;
  }
  if (hasTrue(info.payments, "nfc_mobile_payments")) {
    formattedBiz.nfc_mobile_payments = true;
  }

  // planning
  if (hasTrue(info.planning, "appointments_recommended")) {
    formattedBiz.appointments_recommended = true;
  }

  formattedBiz.permanently_closed = toBoolString(formattedBiz.permanently_closed);
  formattedBiz.temporarily_closed = toBoolString(formattedBiz.temporarily_closed);
  formattedBiz.is_advertisement = toBoolString(
    formattedBiz.is_advertisement ?? false
  );
  formattedBiz.language = formattedBiz.language || "en";
  formattedBiz.website = formattedBiz.website || "";
  formattedBiz.cid = normalizeCid(formattedBiz.cid);
  formattedBiz.reviews_distribution = normalizeReviewsDistribution(
    formattedBiz.reviews_distribution
  );

  formattedBiz.booking_links = Array.isArray(formattedBiz.booking_links)
    ? formattedBiz.booking_links
    : [];
  formattedBiz.owner_updates = Array.isArray(formattedBiz.owner_updates)
    ? formattedBiz.owner_updates
    : [];
  formattedBiz.image_urls = Array.isArray(formattedBiz.image_urls)
    ? formattedBiz.image_urls
    : [];

  formattedBiz.highlights = Array.isArray(bizData.highlights)
    ? bizData.highlights
    : buildHighlights(formattedBiz);

  return formattedBiz;
}

export function formatBusinesses() {
  const rawData = fs.readFileSync("./src/data/start.json", "utf-8");
  const businesses = JSON.parse(rawData);

  // Format businesses
  const formatted = businesses.map(formatBusiness);

  fs.writeFileSync(
    "./src/data/formatted.json",
    JSON.stringify(formatted, null, 2)
  );
  console.log("✅ Formatted data saved as formatted.json");
}
