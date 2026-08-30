import { buildHighlights } from "../lib/listingSeo.js";

const hasTrue = (arr, label) =>
  Array.isArray(arr) && arr.some((item) => item[label]);

function toBoolString(val) {
  if (val === "TRUE" || val === "FALSE") return val;
  return val ? "TRUE" : "FALSE";
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

function toSnakeCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s\-]+/g, "_")
    .toLowerCase();
}

function keysToSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnakeCase(item));
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnakeCase(key),
        keysToSnakeCase(value),
      ])
    );
  }
  return obj;
}

export function formatBusiness(biz) {
  const bizData = biz.enriched || {};
  const enrichedBiz = {
    ...biz,
    latitude: biz.location?.lat || "",
    longitude: biz.location?.lng || "",
    timezone: biz.timezone ?? null,
    mechanic: false,
    restroom: false,
    credit_cards: false,
    debit_cards: false,
    wheelchair_accessible: false,
    onsite_services: false,
    oil_change: false,
    nfc_mobile_payments: false,
    appointments_recommended: false,
    description: bizData.description || "",
    service_tags: bizData.serviceTags ? bizData.serviceTags.join(", ") : "",
    title_tag: bizData.titleTag || "",
    meta_description: bizData.metaDescription || "",
    local_note: bizData.localNote || "",
    opening_hours_specification:
      bizData.localBusinessSchema?.openingHoursSpecification || null,
    keywords: normalizeKeywords(bizData.localBusinessSchema?.keywords),
  };

  const formattedBiz = keysToSnakeCase(enrichedBiz);

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
  delete formattedBiz.neighborhood;
  delete formattedBiz.street;
  delete formattedBiz.country_code;
  delete formattedBiz.fid;
  delete formattedBiz.cid;
  delete formattedBiz.rank;
  delete formattedBiz.kgmid;
  delete formattedBiz.reviews_distribution;
  delete formattedBiz.booking_links;
  delete formattedBiz.owner_updates;
  delete formattedBiz.image_urls;

  const info = formattedBiz.additional_info || {};

  if (hasTrue(info.service_options, "onsite_services")) {
    formattedBiz.onsite_services = true;
  }
  if (
    hasTrue(info.accessibility, "wheelchair_accessible_entrance") ||
    hasTrue(info.accessibility, "wheelchair_accessible_parking_lot") ||
    hasTrue(info.accessibility, "wheelchair_accessible_restroom") ||
    hasTrue(info.accessibility, "wheelchair_accessible_seating")
  ) {
    formattedBiz.wheelchair_accessible = true;
  }
  if (hasTrue(info.offerings, "oil_change")) {
    formattedBiz.oil_change = true;
  }
  if (hasTrue(info.amenities, "mechanic")) {
    formattedBiz.mechanic = true;
  }
  if (hasTrue(info.amenities, "restroom")) {
    formattedBiz.restroom = true;
  }
  if (hasTrue(info.payments, "credit_cards")) {
    formattedBiz.credit_cards = true;
  }
  if (hasTrue(info.payments, "debit_cards")) {
    formattedBiz.debit_cards = true;
  }
  if (hasTrue(info.payments, "nfc_mobile_payments")) {
    formattedBiz.nfc_mobile_payments = true;
  }
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

  formattedBiz.highlights = Array.isArray(bizData.highlights)
    ? bizData.highlights
    : buildHighlights({
        features: formattedBiz,
        total_score: formattedBiz.total_score,
        reviews_count: formattedBiz.reviews_count,
      });

  return formattedBiz;
}
