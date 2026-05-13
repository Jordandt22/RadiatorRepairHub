import fs from "fs";
import { parse } from "json2csv";

const hasTrue = (arr, label) =>
  Array.isArray(arr) && arr.some((item) => item[label]);

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

export function flattenBusiness(biz) {
  const bizData = biz.enriched || {};
  const enrichedBiz = {
    ...biz,

    // Location
    latitude: biz.location?.lat || "",
    longitude: biz.location?.lng || "",

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
    keywords: bizData.localBusinessSchema?.keywords || "",
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
  const info = formattedBiz.additional_info;

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

  return formattedBiz;
}

async function main() {
  const rawData = fs.readFileSync("./src/formatted/start.json", "utf-8");
  const businesses = JSON.parse(rawData);
  const flattened = businesses.map(flattenBusiness);

  fs.writeFileSync(
    "./src/formatted/final.json",
    JSON.stringify(flattened, null, 2)
  );

  const csv = parse(flattened);
  fs.writeFileSync("./src/formatted/final.csv", csv);

  console.log("✅ Flattened CSV saved as final.csv");
}

main().catch(console.error);
