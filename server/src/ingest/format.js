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
    : buildHighlights(formattedBiz);

  return formattedBiz;
}
