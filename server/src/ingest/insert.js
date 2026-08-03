import { randomUUID } from "crypto";
import slugify from "slugify";
import { supabase } from "../supabase/supabase.js";
import { formatBusiness } from "./format.js";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function makeSlug(name) {
  return slugify(name || "", { lower: true, strict: true });
}

function normalizeStateCode(stateCode) {
  return stateCode?.toString().toUpperCase();
}

function normalizePostalCode(zip) {
  if (zip == null || zip === "") return null;
  const str = zip.toString().trim();
  const num = Number(str);
  return Number.isNaN(num) ? str : num;
}

function isDuplicateError(error) {
  if (!error) return false;
  if (error.code === "23505") return true;
  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return message.includes("duplicate key") || message.includes("already exists");
}

function toHourMinute(timeStr) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

function parseSingleTime(str) {
  str = str
    .trim()
    .toUpperCase()
    .replace(/\u202F/g, "");
  const match = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3];
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  }
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) return `${match24[1].padStart(2, "0")}:${match24[2]}:00`;
  return null;
}

function parseMultipleHours(str) {
  const periods = [];
  const parts = str.split(/,/);
  for (const p of parts) {
    const [open, close] = p.split(/\s+to\s+/i).map((s) => s && s.trim());
    if (!open || !close) continue;
    periods.push({
      open: toHourMinute(parseSingleTime(open)),
      close: toHourMinute(parseSingleTime(close)),
    });
  }
  return periods;
}

function buildBusinessHoursRows(businessId, openingHours = []) {
  const dayMap = new Map(openingHours.map((h) => [h.day, h.hours]));
  const rows = [];

  for (const day of DAYS) {
    const hoursStr = dayMap.get(day);

    if (!hoursStr || hoursStr.toLowerCase().includes("closed")) {
      rows.push({
        business_id: businessId,
        day_of_week: day,
        hours: [],
        is_closed: true,
        hours_text: "Closed",
      });
    } else if (
      hoursStr.toLowerCase().includes("24 hours") ||
      hoursStr.toLowerCase().includes("open 24 hours")
    ) {
      rows.push({
        business_id: businessId,
        day_of_week: day,
        hours: [{ open: "00:00", close: "23:59" }],
        is_closed: false,
        hours_text: hoursStr,
      });
    } else {
      rows.push({
        business_id: businessId,
        day_of_week: day,
        hours: parseMultipleHours(hoursStr),
        is_closed: false,
        hours_text: hoursStr,
      });
    }
  }

  return rows;
}

async function loadReferenceMaps() {
  const [
    { data: states, error: statesError },
    { data: cities, error: citiesError },
    { data: postalCodes, error: postalError },
    { data: primaryCategories, error: primaryError },
    { data: secondaryCategories, error: secondaryError },
  ] = await Promise.all([
    supabase.from("states").select("id, name, code"),
    supabase.from("cities").select("id, name, slug, state_id"),
    supabase.from("postal_codes").select("id, code, city_id"),
    supabase.from("primary_categories").select("id, name, slug"),
    supabase.from("secondary_categories").select("id, name, slug"),
  ]);

  if (statesError) throw statesError;
  if (citiesError) throw citiesError;
  if (postalError) throw postalError;
  if (primaryError) throw primaryError;
  if (secondaryError) throw secondaryError;

  const stateMap = Object.fromEntries(
    (states || []).map((s) => [s.name.toLowerCase(), s])
  );
  const stateCodeMap = Object.fromEntries(
    (states || []).map((s) => [s.code.toLowerCase(), s])
  );
  const stateIdToCode = Object.fromEntries(
    (states || []).map((s) => [s.id, normalizeStateCode(s.code)])
  );

  const cityByKey = {};
  for (const c of cities || []) {
    const stateCode = stateIdToCode[c.state_id];
    if (!stateCode) continue;
    cityByKey[`${c.slug}|${c.state_id}|${stateCode}`] = c;
  }

  const cityIdToMeta = {};
  for (const c of cities || []) {
    const stateCode = stateIdToCode[c.state_id];
    if (!stateCode) continue;
    cityIdToMeta[c.id] = { slug: c.slug, stateId: c.state_id, stateCode };
  }

  const postalByKey = {};
  for (const p of postalCodes || []) {
    const meta = cityIdToMeta[p.city_id];
    if (!meta) continue;
    postalByKey[
      `${meta.slug}|${meta.stateCode}|${p.code.toString().toLowerCase()}`
    ] = p;
  }

  const primaryBySlug = Object.fromEntries(
    (primaryCategories || []).map((p) => [p.slug, p])
  );
  const secondaryBySlug = Object.fromEntries(
    (secondaryCategories || []).map((s) => [s.slug, s])
  );

  return {
    stateMap,
    stateCodeMap,
    cityByKey,
    postalByKey,
    primaryBySlug,
    secondaryBySlug,
  };
}

async function resolveCity(maps, name, state) {
  const slug = makeSlug(name);
  const stateCode = normalizeStateCode(state.code);
  const key = `${slug}|${state.id}|${stateCode}`;
  if (maps.cityByKey[key]) return maps.cityByKey[key];

  const city = {
    id: randomUUID(),
    name: name.trim(),
    state_id: state.id,
    slug,
  };

  const { error } = await supabase.from("cities").insert(city);
  if (error && !isDuplicateError(error)) throw error;

  if (isDuplicateError(error)) {
    const { data: existing, error: fetchError } = await supabase
      .from("cities")
      .select("id, name, slug, state_id")
      .eq("slug", slug)
      .eq("state_id", state.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) throw error;
    maps.cityByKey[key] = existing;
    return existing;
  }

  maps.cityByKey[key] = city;
  return city;
}

async function resolvePostalCode(maps, code, city, state) {
  if (!code || !city) return null;

  const normalized = normalizePostalCode(code);
  const key = `${city.slug}|${normalizeStateCode(state.code)}|${normalized
    .toString()
    .toLowerCase()}`;
  if (maps.postalByKey[key]) return maps.postalByKey[key];

  const postalCode = {
    id: randomUUID(),
    code: String(normalized),
    city_id: city.id,
  };

  const { error } = await supabase.from("postal_codes").insert(postalCode);
  if (error && !isDuplicateError(error)) throw error;

  if (isDuplicateError(error)) {
    const { data: existing, error: fetchError } = await supabase
      .from("postal_codes")
      .select("id, code, city_id")
      .eq("city_id", city.id)
      .eq("code", String(normalized))
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) throw error;
    maps.postalByKey[key] = existing;
    return existing;
  }

  maps.postalByKey[key] = postalCode;
  return postalCode;
}

async function resolvePrimaryCategory(maps, name) {
  if (!name) return null;
  const slug = makeSlug(name);
  if (maps.primaryBySlug[slug]) return maps.primaryBySlug[slug];

  const category = { id: randomUUID(), name: name.trim(), slug };
  const { error } = await supabase.from("primary_categories").insert(category);
  if (error && !isDuplicateError(error)) throw error;

  if (isDuplicateError(error)) {
    const { data: existing, error: fetchError } = await supabase
      .from("primary_categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) throw error;
    maps.primaryBySlug[slug] = existing;
    return existing;
  }

  maps.primaryBySlug[slug] = category;
  return category;
}

async function resolveSecondaryCategory(maps, name) {
  const slug = makeSlug(name);
  if (maps.secondaryBySlug[slug]) return maps.secondaryBySlug[slug];

  const category = { id: randomUUID(), name: name.trim(), slug };
  const { error } = await supabase.from("secondary_categories").insert(category);
  if (error && !isDuplicateError(error)) throw error;

  if (isDuplicateError(error)) {
    const { data: existing, error: fetchError } = await supabase
      .from("secondary_categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) throw error;
    maps.secondaryBySlug[slug] = existing;
    return existing;
  }

  maps.secondaryBySlug[slug] = category;
  return category;
}

async function insertOneBusiness(prepared) {
  const businessInsert = {
    id: prepared.id,
    slug: prepared.slug,
    title: prepared.title,
    address: prepared.address,
    city_id: prepared.city_id,
    postal_code_id: prepared.postal_code_id,
    state_id: prepared.state_id,
    website: prepared.website,
    phone: prepared.phone,
    total_score: prepared.total_score,
    place_id: prepared.place_id,
    primary_category_id: prepared.primary_category_id,
    reviews_count: Number(prepared.reviews_count) || 0,
    scraped_at: prepared.scraped_at,
    url: prepared.url,
    image_url: prepared.image_url,
    latitude: Number(prepared.latitude),
    longitude: Number(prepared.longitude),
    timezone: prepared.timezone,
    description: prepared.description,
    title_tag: prepared.title_tag,
    meta_description: prepared.meta_description,
    local_note: prepared.local_note,
    keywords: Array.isArray(prepared.keywords) ? prepared.keywords : [],
    highlights: Array.isArray(prepared.highlights) ? prepared.highlights : [],
  };

  const { data: inserted, error } = await supabase
    .from("businesses")
    .insert(businessInsert)
    .select("id, place_id, slug, title")
    .single();

  if (error) throw error;

  const businessId = inserted.id;
  const hoursRows = buildBusinessHoursRows(businessId, prepared.opening_hours);
  if (hoursRows.length > 0) {
    const { error: hoursError } = await supabase
      .from("business_hours")
      .insert(hoursRows);
    if (hoursError) throw hoursError;
  }

  const { error: featuresError } = await supabase.from("business_features").insert({
    business_id: businessId,
    mechanic: prepared.mechanic || false,
    restroom: prepared.restroom || false,
    credit_cards: prepared.credit_cards || false,
    debit_cards: prepared.debit_cards || false,
    wheelchair_accessible: prepared.wheelchair_accessible || false,
    onsite_services: prepared.onsite_services || false,
    oil_change: prepared.oil_change || false,
    nfc_mobile_payments: prepared.nfc_mobile_payments || false,
    appointments_recommended: prepared.appointments_recommended || false,
  });
  if (featuresError) throw featuresError;

  const secondaryRows = (prepared.secondary_category_ids || []).map(
    (secondary_category_id) => ({
      business_id: businessId,
      secondary_category_id,
    })
  );
  if (secondaryRows.length > 0) {
    const { error: secondaryError } = await supabase
      .from("business_secondary_categories")
      .insert(secondaryRows);
    if (secondaryError) throw secondaryError;
  }

  return inserted;
}

/**
 * Format + resolve live FKs + insert. Soft-fail per business.
 * @param {object[]} enrichedBusinesses
 */
export async function insertEnrichedBusinesses(enrichedBusinesses) {
  if (!Array.isArray(enrichedBusinesses)) {
    throw new Error("Insert payload must be an array");
  }

  const maps = await loadReferenceMaps();
  const succeeded = [];
  const failed = [];

  for (const raw of enrichedBusinesses) {
    try {
      const biz = formatBusiness(raw);

      const stateVal = biz.state?.trim().toLowerCase();
      const state = maps.stateMap[stateVal] || maps.stateCodeMap[stateVal];
      if (!state) {
        throw new Error(`State not found: ${biz.state}`);
      }
      if (!biz.city?.trim()) {
        throw new Error("City missing");
      }
      if (!biz.place_id) {
        throw new Error("place_id missing");
      }
      if (!biz.timezone) {
        throw new Error("timezone missing");
      }

      const { data: existing } = await supabase
        .from("businesses")
        .select("id, place_id")
        .eq("place_id", biz.place_id)
        .maybeSingle();
      if (existing) {
        throw new Error(`Duplicate place_id: ${biz.place_id}`);
      }

      const city = await resolveCity(maps, biz.city, state);
      const postalCode = await resolvePostalCode(
        maps,
        biz.postal_code,
        city,
        state
      );
      const primaryCategory = await resolvePrimaryCategory(
        maps,
        biz.category_name
      );

      const secondaryCategoryIds = [];
      if (Array.isArray(biz.categories)) {
        for (const sec of biz.categories) {
          const secCategory = await resolveSecondaryCategory(maps, sec);
          if (!secondaryCategoryIds.includes(secCategory.id)) {
            secondaryCategoryIds.push(secCategory.id);
          }
        }
      }

      const id = randomUUID();
      const prepared = {
        ...biz,
        id,
        slug: `${makeSlug(biz.title)}-${id}`,
        state_id: state.id,
        city_id: city.id,
        postal_code_id: postalCode?.id || null,
        primary_category_id: primaryCategory?.id || null,
        secondary_category_ids: secondaryCategoryIds,
      };

      const inserted = await insertOneBusiness(prepared);
      succeeded.push({
        id: inserted.id,
        place_id: inserted.place_id,
        slug: inserted.slug,
        title: inserted.title,
        primary_category: primaryCategory?.name ?? biz.category_name ?? null,
        city: city?.name ?? biz.city ?? null,
        state: state?.name ?? state?.code ?? biz.state ?? null,
        postal_code: postalCode?.code ?? biz.postal_code ?? null,
        total_score:
          biz.total_score != null && biz.total_score !== ""
            ? Number(biz.total_score)
            : null,
      });
    } catch (err) {
      failed.push({
        title: raw?.title ?? null,
        placeId: raw?.placeId ?? raw?.place_id ?? null,
        error: err?.message || "Insert failed",
      });
    }
  }

  return { succeeded, failed };
}
