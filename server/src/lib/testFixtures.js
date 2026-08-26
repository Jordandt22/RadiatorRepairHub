import { randomBytes, randomUUID } from "crypto";
import slugify from "slugify";
import { supabase, adminAuthClient } from "../supabase/supabase.js";
import { getPasswordStrengthError } from "./password.js";
import { buildIlikeOrFilter, sanitizeIlikeSearch } from "./sanitizeSearch.js";
import { normalizeWebsiteUrl } from "./websiteReachability.js";

const TEST_BUSINESS_LIST_SELECT =
  "id, title, slug, email, phone, address, website, is_claimed, is_featured, owner_uid, total_score, reviews_count, created_at, city:cities(name, slug), state:states(name, code)";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TEST_TEMPLATE_SELECT = `
  id, address, city_id, state_id, postal_code_id, primary_category_id,
  website, phone, total_score, reviews_count, latitude, longitude,
  timezone, description, title_tag, meta_description, local_note,
  keywords, highlights, image_url,
  city:cities(name, slug),
  state:states(name, code),
  postal_code:postal_codes(code),
  primary_category:primary_categories(name)
`;

function makeSlug(name) {
  return slugify(name || "", { lower: true, strict: true });
}

function shortId() {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return [];
}

function closedHoursRows() {
  return DAYS.map((day_of_week) => ({
    day_of_week,
    hours: [],
    is_closed: true,
    hours_text: "Closed",
  }));
}

function normalizeHoursRows(rows) {
  const byDay = new Map(
    (rows ?? [])
      .filter((row) => row?.day_of_week)
      .map((row) => [row.day_of_week, row])
  );

  return DAYS.map((day_of_week) => {
    const row = byDay.get(day_of_week);
    if (!row) {
      return {
        day_of_week,
        hours: [],
        is_closed: true,
        hours_text: "Closed",
      };
    }
    return {
      day_of_week,
      hours: Array.isArray(row.hours) ? row.hours : [],
      is_closed: Boolean(row.is_closed),
      hours_text:
        typeof row.hours_text === "string" && row.hours_text.trim()
          ? row.hours_text
          : row.is_closed
            ? "Closed"
            : "",
    };
  });
}

function locationLabel({ city, state, postal }) {
  const cityName = city?.name || "";
  const stateCode = state?.code || "";
  const zip = postal?.code ? String(postal.code) : "";
  const cityState = [cityName, stateCode].filter(Boolean).join(", ");
  return [cityState, zip].filter(Boolean).join(" ") || "Unknown location";
}

export function generateTestUserEmail() {
  return `test+${Date.now()}@radiatorrepairhub.com`;
}

export function generateTestUserPassword() {
  return `Test!${randomBytes(4).toString("hex")}`;
}

export function generateTestBusinessPlaceId() {
  return `test_${randomUUID()}`;
}

function buildDraftFromTemplate(template, ids) {
  const id = shortId();
  const title = `RRH Test Business ${id}`;
  const slug = makeSlug(title);
  const city = template?.city ?? null;
  const state = template?.state ?? null;
  const postal = template?.postal_code ?? null;
  const category = template?.primary_category ?? null;

  return {
    title,
    slug,
    email: `test+biz-${id}@radiatorrepairhub.com`,
    phone: template?.phone || "(202) 555-0142",
    address: template?.address || "123 Test Street",
    website: template?.website || null,
    total_score:
      typeof template?.total_score === "number" ? template.total_score : 4.5,
    reviews_count:
      Number.isFinite(Number(template?.reviews_count))
        ? Number(template.reviews_count)
        : 12,
    latitude:
      typeof template?.latitude === "number" ? template.latitude : 34.0522,
    longitude:
      typeof template?.longitude === "number" ? template.longitude : -118.2437,
    city_id: ids.city_id,
    state_id: ids.state_id,
    postal_code_id: ids.postal_code_id,
    primary_category_id: ids.primary_category_id,
    timezone: template?.timezone || "America/Los_Angeles",
    description: String(
      template?.description ||
        "Internal test listing used to exercise claims, Featured billing, and directory placement."
    ).slice(0, 750),
    title_tag: String(
      template?.title_tag || `${title} | Radiator Repair`
    ).slice(0, 100),
    meta_description: String(
      template?.meta_description ||
        "Internal RadiatorRepairHub test listing. Do not contact."
    ).slice(0, 200),
    local_note: String(
      template?.local_note ||
        "This is an internal test listing and is not a real shop."
    ).slice(0, 500),
    keywords: asArray(template?.keywords)
      .map((keyword) => String(keyword ?? "").trim())
      .filter(Boolean)
      .slice(0, 30)
      .concat(["radiator repair", "test listing"])
      .filter((keyword, index, list) => list.indexOf(keyword) === index)
      .slice(0, 30),
    highlights: asArray(template?.highlights),
    image_url: template?.image_url || null,
    place_id: generateTestBusinessPlaceId(),
    hours: normalizeHoursRows(template?.hours),
    secondary_category_ids: asArray(template?.secondary_category_ids)
      .filter(Boolean)
      .slice(0, 10),
    location_label: locationLabel({ city, state, postal }),
    category_label: category?.name || "Radiator repair",
  };
}

async function loadTemplateRelations(businessId) {
  if (!businessId) {
    return { hours: closedHoursRows(), secondary_category_ids: [], error: null };
  }

  const [
    { data: hoursRows, error: hoursError },
    { data: secondaryRows, error: secondaryError },
  ] = await Promise.all([
    supabase
      .from("business_hours")
      .select("day_of_week, hours, is_closed, hours_text")
      .eq("business_id", businessId),
    supabase
      .from("business_secondary_categories")
      .select("secondary_category_id")
      .eq("business_id", businessId),
  ]);

  if (hoursError) {
    return { hours: null, secondary_category_ids: null, error: hoursError };
  }
  if (secondaryError) {
    return { hours: null, secondary_category_ids: null, error: secondaryError };
  }

  return {
    hours: normalizeHoursRows(hoursRows),
    secondary_category_ids: (secondaryRows ?? [])
      .map((row) => row.secondary_category_id)
      .filter(Boolean),
    error: null,
  };
}

async function loadFallbackIds() {
  const [{ data: city, error: cityError }, { data: category, error: catError }] =
    await Promise.all([
      supabase
        .from("cities")
        .select("id, name, slug, state_id, state:states(id, name, code)")
        .limit(1)
        .maybeSingle(),
      supabase.from("primary_categories").select("id, name").limit(1).maybeSingle(),
    ]);

  if (cityError) return { ids: null, error: cityError, city, category: null };
  if (catError) return { ids: null, error: catError, city, category: null };

  return {
    ids: {
      city_id: city?.id ?? null,
      state_id: city?.state_id ?? city?.state?.id ?? null,
      postal_code_id: null,
      primary_category_id: category?.id ?? null,
    },
    city,
    category,
    error: null,
  };
}

export async function getTestBusinessDefaults() {
  const { data: template, error: templateError } = await supabase
    .from("businesses")
    .select(TEST_TEMPLATE_SELECT)
    .eq("is_test", false)
    .not("city_id", "is", null)
    .not("state_id", "is", null)
    .not("primary_category_id", "is", null)
    .order("reviews_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (templateError) {
    return { data: null, error: templateError };
  }

  if (template?.city_id && template?.state_id && template?.primary_category_id) {
    const relations = await loadTemplateRelations(template.id);
    if (relations.error) {
      return { data: null, error: relations.error };
    }
    return {
      data: buildDraftFromTemplate(
        {
          ...template,
          hours: relations.hours,
          secondary_category_ids: relations.secondary_category_ids,
        },
        {
          city_id: template.city_id,
          state_id: template.state_id,
          postal_code_id: template.postal_code_id ?? null,
          primary_category_id: template.primary_category_id,
        }
      ),
      error: null,
    };
  }

  const fallback = await loadFallbackIds();
  if (fallback.error) {
    return { data: null, error: fallback.error };
  }
  if (
    !fallback.ids?.city_id ||
    !fallback.ids?.state_id ||
    !fallback.ids?.primary_category_id
  ) {
    return {
      data: null,
      error: {
        message:
          "Cannot create a test business until the directory has at least one city, state, and primary category.",
      },
    };
  }

  return {
    data: buildDraftFromTemplate(
      {
        city: fallback.city,
        state: fallback.city?.state,
        primary_category: fallback.category,
      },
      fallback.ids
    ),
    error: null,
  };
}

export async function listTestBusinesses(page, limit, { q = null } = {}) {
  let query = supabase
    .from("businesses")
    .select(TEST_BUSINESS_LIST_SELECT, { count: "exact" })
    .eq("is_test", true)
    .order("created_at", { ascending: false });

  const sanitized = sanitizeIlikeSearch(q);
  if (sanitized) {
    const orFilter = buildIlikeOrFilter(
      ["title", "slug", "email", "phone"],
      sanitized
    );
    if (orFilter) query = query.or(orFilter);
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    return { data: null, count, error };
  }

  const businesses = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    email: row.email,
    phone: row.phone,
    address: row.address,
    website: row.website,
    is_claimed: Boolean(row.is_claimed),
    is_featured: Boolean(row.is_featured),
    owner_uid: row.owner_uid ?? null,
    total_score: row.total_score,
    reviews_count: row.reviews_count,
    created_at: row.created_at,
    city_name: row.city?.name ?? null,
    state_code: row.state?.code ?? null,
  }));

  return { data: businesses, count, error: null };
}

export async function getTestBusinessById(id) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, title, is_test, is_featured, owner_uid")
    .eq("id", id)
    .maybeSingle();

  return { data, error };
}

async function ensureUniqueSlug(baseSlug, id) {
  const fallback = `${makeSlug(baseSlug) || "rrh-test-business"}-${id.slice(0, 8)}`;
  const candidate = makeSlug(baseSlug) || fallback;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", candidate)
    .maybeSingle();

  return data ? fallback : candidate;
}

async function ensureUniquePlaceId(placeId, id) {
  const candidate =
    typeof placeId === "string" && placeId.trim()
      ? placeId.trim()
      : `test_${id}`;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("place_id", candidate)
    .maybeSingle();

  return data ? `test_${id}` : candidate;
}

export async function insertTestBusiness(input) {
  const id = randomUUID();
  const slug = await ensureUniqueSlug(input.slug || input.title, id);
  const placeId = await ensureUniquePlaceId(input.place_id, id);

  const businessInsert = {
    id,
    slug,
    title: input.title,
    address: input.address,
    city_id: input.city_id,
    postal_code_id: input.postal_code_id || null,
    state_id: input.state_id,
    website: normalizeWebsiteUrl(input.website) || null,
    phone: input.phone,
    email: input.email || null,
    total_score: Number(input.total_score),
    place_id: placeId,
    primary_category_id: input.primary_category_id,
    reviews_count: Number(input.reviews_count) || 0,
    image_url: input.image_url || null,
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    timezone: input.timezone,
    description: input.description,
    title_tag: input.title_tag,
    meta_description: input.meta_description,
    local_note: input.local_note,
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
    highlights: Array.isArray(input.highlights) ? input.highlights : [],
    is_test: true,
    is_claimed: false,
    is_featured: false,
    owner_uid: null,
  };

  const { data: inserted, error } = await supabase
    .from("businesses")
    .insert(businessInsert)
    .select("id, slug, title, email, phone, created_at, is_claimed, is_featured")
    .single();

  if (error) {
    return { data: null, error };
  }

  const { error: featuresError } = await supabase.from("business_features").insert({
    business_id: inserted.id,
    mechanic: false,
    restroom: false,
    credit_cards: false,
    debit_cards: false,
    wheelchair_accessible: false,
    onsite_services: false,
    oil_change: false,
    nfc_mobile_payments: false,
    appointments_recommended: false,
  });

  if (featuresError) {
    await supabase.from("businesses").delete().eq("id", inserted.id);
    return { data: null, error: featuresError };
  }

  const hoursRows = normalizeHoursRows(input.hours).map((row) => ({
    business_id: inserted.id,
    day_of_week: row.day_of_week,
    hours: row.hours,
    is_closed: row.is_closed,
    hours_text: row.hours_text,
  }));

  const { error: hoursError } = await supabase
    .from("business_hours")
    .insert(hoursRows);

  if (hoursError) {
    await supabase.from("businesses").delete().eq("id", inserted.id);
    return { data: null, error: hoursError };
  }

  const secondaryIds = [
    ...new Set(
      (Array.isArray(input.secondary_category_ids)
        ? input.secondary_category_ids
        : []
      ).filter(Boolean)
    ),
  ].slice(0, 10);

  if (secondaryIds.length) {
    const { error: secondaryError } = await supabase
      .from("business_secondary_categories")
      .insert(
        secondaryIds.map((secondary_category_id) => ({
          business_id: inserted.id,
          secondary_category_id,
        }))
      );

    if (secondaryError) {
      await supabase.from("businesses").delete().eq("id", inserted.id);
      return { data: null, error: secondaryError };
    }
  }

  return { data: inserted, error: null };
}

export async function deleteTestBusinessRow(id) {
  const { error: claimError } = await supabase
    .from("claim_requests")
    .delete()
    .eq("business_id", id);

  if (claimError) {
    return { error: claimError };
  }

  const { data, error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", id)
    .eq("is_test", true)
    .select("id, slug")
    .maybeSingle();

  return { data, error };
}

async function enrichTestUsers(rows) {
  const uids = rows.map((row) => row.uid).filter(Boolean);
  const emailByUid = new Map();

  await Promise.all(
    uids.map(async (uid) => {
      try {
        const { data: authData, error: authError } =
          await adminAuthClient.getUserById(uid);
        if (!authError && authData?.user?.email) {
          emailByUid.set(uid, authData.user.email);
        }
      } catch {
        // skip missing auth users
      }
    })
  );

  const claimedByUid = new Map();
  if (uids.length) {
    const { data: claimedRows, error: claimedError } = await supabase
      .from("businesses")
      .select("owner_uid")
      .in("owner_uid", uids)
      .eq("is_claimed", true);

    if (claimedError) {
      return { users: null, error: claimedError };
    }

    for (const row of claimedRows ?? []) {
      if (!row?.owner_uid) continue;
      claimedByUid.set(
        row.owner_uid,
        (claimedByUid.get(row.owner_uid) ?? 0) + 1
      );
    }
  }

  return {
    users: rows.map((row) => ({
      uid: row.uid,
      email: emailByUid.get(row.uid) ?? null,
      role: row.role ?? null,
      created_at: row.created_at ?? null,
      claimed_count: claimedByUid.get(row.uid) ?? 0,
    })),
    error: null,
  };
}

export async function listTestUsers(page, limit, { q = null } = {}) {
  const sanitized = sanitizeIlikeSearch(q);

  if (sanitized) {
    const { data, error } = await supabase
      .from("users")
      .select("uid, role, created_at")
      .eq("is_test", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return { data: null, count: null, error };
    }

    const enriched = await enrichTestUsers(data ?? []);
    if (enriched.error) {
      return { data: null, count: null, error: enriched.error };
    }

    const needle = sanitized.toLowerCase();
    const matched = (enriched.users ?? []).filter((user) => {
      const email = typeof user.email === "string" ? user.email.toLowerCase() : "";
      const uid = typeof user.uid === "string" ? user.uid.toLowerCase() : "";
      return email.includes(needle) || uid.includes(needle);
    });
    const start = (page - 1) * limit;
    return {
      data: matched.slice(start, start + limit),
      count: matched.length,
      error: null,
    };
  }

  const { data, count, error } = await supabase
    .from("users")
    .select("uid, role, created_at", { count: "exact" })
    .eq("is_test", true)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return { data: null, count, error };
  }

  const enriched = await enrichTestUsers(data ?? []);
  if (enriched.error) {
    return { data: null, count, error: enriched.error };
  }

  return { data: enriched.users, count, error: null };
}

export async function getTestUserByUid(uid) {
  const { data, error } = await supabase
    .from("users")
    .select("uid, role, created_at, is_test")
    .eq("uid", uid)
    .maybeSingle();

  return { data, error };
}

export async function insertTestUser({ email, password }) {
  const strengthError = getPasswordStrengthError(password);
  if (strengthError) {
    return { data: null, error: { message: strengthError, code: "form-error" } };
  }

  const { data: authData, error: authError } = await adminAuthClient.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData?.user?.id) {
    return { data: null, error: authError || { message: "Unable to create auth user." } };
  }

  const uid = authData.user.id;
  const { error: insertError } = await supabase.from("users").insert({
    uid,
    role: "business_owner",
    is_test: true,
  });

  if (insertError) {
    try {
      await adminAuthClient.deleteUser(uid);
    } catch {
      // best-effort rollback
    }
    return { data: null, error: insertError };
  }

  return {
    data: {
      uid,
      email: authData.user.email || email,
      password,
      role: "business_owner",
      created_at: authData.user.created_at ?? new Date().toISOString(),
      claimed_count: 0,
    },
    error: null,
  };
}
