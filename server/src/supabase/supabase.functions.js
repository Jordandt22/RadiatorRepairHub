import {
  supabase,
  adminAuthClient,
  supabaseAnon,
  createUserSupabaseClient,
  supabaseUrl,
  supabaseAnonKey,
} from "./supabase.js";
import {
  getScoreTier,
  getReviewTier,
} from "../lib/adminBusinessTiers.js";

const listingBusinessSelect = `*, state:states(*), city:cities(*), postal_code:postal_codes(*), primary_category:primary_categories(*), features:business_features!inner(*)`;
const fullBusinessSelect = `*, state:states(*), city:cities!inner(*), postal_code:postal_codes(*), primary_category:primary_categories(*), secondary_categories:business_secondary_categories(secondary_categories(*)), features:business_features!inner(*), hours:business_hours!inner(*)`;

const formatBusinessListings = (data) => {
  data.map((business) => delete business.additional_info);

  data.map((business) => {
    business.features = { ...business.features[0] };
    delete business.features.id;
    delete business.features.business_id;
    business.is_claimed = Boolean(business?.is_claimed);

    if (business?.secondary_categories) {
      business.secondary_categories = business.secondary_categories.map(
        (item) => ({
          ...item.secondary_categories,
        })
      );
    }

    return business;
  });

  return data;
};

const formatFullBusiness = (business) => {
  if (!business) return business;

  if (business?.secondary_categories) {
    business.secondary_categories = business.secondary_categories
      .map((item) => item?.secondary_categories)
      .filter(Boolean);
  } else {
    business.secondary_categories = [];
  }

  if (business?.features) {
    business.features = { ...business.features };
    delete business.features.id;
    delete business.features.business_id;
  }

  if (business?.hours) {
    business.hours = business.hours.map((item) => {
      delete item.id;
      delete item.business_id;
      return {
        ...item,
      };
    });
  }

  business.is_claimed = Boolean(business?.is_claimed);
  business.last_edited_at = business.last_edited_at ?? null;

  return business;
};
// ---- Database ----

// Businesses
const FEATURED_LIMIT = 12;
const FEATURED_CLAIMED_MIN_REVIEWS = 25;
const FEATURED_FILL_MIN_REVIEWS = 400;

const featuredListingSelect =
  listingBusinessSelect +
  ", secondary_categories:business_secondary_categories!inner(secondary_categories(*)), hours:business_hours!inner(*)";

const sortFeaturedBusinesses = (a, b) => {
  const claimedDiff =
    Number(Boolean(b.is_claimed)) - Number(Boolean(a.is_claimed));
  if (claimedDiff !== 0) return claimedDiff;

  const scoreDiff = (Number(b.total_score) || 0) - (Number(a.total_score) || 0);
  if (scoreDiff !== 0) return scoreDiff;

  return (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0);
};

/** Claimed-first fill, then top-rated (high review count) to reach FEATURED_LIMIT. */
export const getTopRatedBusinesses = async () => {
  const {
    data: claimedData,
    error: claimedError,
  } = await supabase
    .from("businesses")
    .select(featuredListingSelect)
    .eq("is_claimed", true)
    .gte("reviews_count", FEATURED_CLAIMED_MIN_REVIEWS)
    .order("total_score", { ascending: false })
    .limit(FEATURED_LIMIT);

  if (claimedError) {
    return { data: null, error: claimedError };
  }

  const claimed = claimedData || [];
  const remaining = FEATURED_LIMIT - claimed.length;

  let fill = [];
  if (remaining > 0) {
    const { data: fillData, error: fillError } = await supabase
      .from("businesses")
      .select(featuredListingSelect)
      .eq("is_claimed", false)
      .gte("reviews_count", FEATURED_FILL_MIN_REVIEWS)
      .order("total_score", { ascending: false })
      .limit(remaining);
    if (fillError) {
      return { data: null, error: fillError };
    }
    fill = fillData || [];
  }

  const merged = [...claimed, ...fill].sort(sortFeaturedBusinesses);
  return { data: formatBusinessListings(merged), error: null };
};

export const getBusinessById = async (business_id) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(fullBusinessSelect)
    .eq("id", business_id)
    .single();

  return { data: formatFullBusiness(data), error };
};

export const getBusinessBySlug = async (business_slug) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(fullBusinessSelect)
    .eq("slug", business_slug)
    .single();

  return { data: formatFullBusiness(data), error };
};

export const getBusinessLastEditedAt = async (business_id) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("last_edited_at")
    .eq("id", business_id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data: data?.last_edited_at ?? null, error: null };
};

export const getBusinessSlugsForSitemap = async () => {
  const pageSize = 1000;
  let from = 0;
  const all = [];

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug, scraped_at")
      .order("slug")
      .range(from, from + pageSize - 1);

    if (error) return { data: null, error };
    if (!data?.length) break;

    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return { data: all, error: null };
};

export const countBusinessesByState = async (state_id) => {
  const { count, error } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("state_id", state_id);

  return { count, error };
};

export const getBusinessesByState = async (state_id, page, limit) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(listingBusinessSelect)
    .eq("state_id", state_id)
    .order("reviews_count", { ascending: false })
    .order("is_claimed", { ascending: false })
    .order("total_score", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (data) {
    return { data: formatBusinessListings(data), error };
  }

  return { data: null, error };
};

export const getCityBySlug = async (city_slug, state_id) => {
  const { data, error } = await supabase
    .from("cities")
    .select("*, state:states(*)")
    .eq("slug", city_slug)
    .eq("state_id", state_id)
    .single();

  return { data, error };
};

export const countBusinessesByCity = async (city_id, state_id) => {
  const { count, error } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("city_id", city_id)
    .eq("state_id", state_id);

  return { count, error };
};

export const getBusinessesByCity = async (city_id, state_id, page, limit) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(listingBusinessSelect)
    .eq("city_id", city_id)
    .eq("state_id", state_id)
    .order("reviews_count", { ascending: false })
    .order("is_claimed", { ascending: false })
    .order("total_score", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (data) {
    return { data: formatBusinessListings(data), error };
  }

  return { data: null, error };
};

export const searchBusinesses = async (
  searchParams,
  page,
  limit,
  sort_option
) => {
  let businessesQuery = supabase
    .from("businesses")
    .select(fullBusinessSelect, { count: "exact" });

  // Applying Filters
  searchParams.map(({ key, value, filter }) => {
    if (filter === "ilike") {
      businessesQuery = businessesQuery.ilike(key, `%${value}%`);
    } else if (filter === "eq") {
      businessesQuery = businessesQuery.eq(key, value);
    } else if (filter === "gte") {
      businessesQuery = businessesQuery.gte(key, value);
    } else if (filter === "in") {
      businessesQuery = businessesQuery.in(key, value);
    }
  });

  // Sorting by Total Score and Reviews Count
  // Soft boost: on default-quality sorts, claimed/verified wins ties (not cases 2/4).
  switch (sort_option) {
    // Most Reviews
    case 1:
      businessesQuery = businessesQuery.order("reviews_count", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("is_claimed", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("total_score", {
        ascending: false,
      });
      break;

    // Least Reviews
    case 2:
      businessesQuery = businessesQuery.order("reviews_count", {
        ascending: true,
      });
      businessesQuery = businessesQuery.order("total_score", {
        ascending: false,
      });
      break;

    // Highest Score
    case 3:
      businessesQuery = businessesQuery.order("total_score", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("is_claimed", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("reviews_count", {
        ascending: false,
      });
      break;

    // Lowest Score
    case 4:
      businessesQuery = businessesQuery.order("total_score", {
        ascending: true,
      });
      businessesQuery = businessesQuery.order("reviews_count", {
        ascending: false,
      });
      break;

    // Default (Most Reviews + soft claimed boost)
    default:
      businessesQuery = businessesQuery.order("reviews_count", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("is_claimed", {
        ascending: false,
      });
      businessesQuery = businessesQuery.order("total_score", {
        ascending: false,
      });
      break;
  }

  // Get Final Data
  const { data, count, error } = await businessesQuery
    .range((page - 1) * limit, page * limit - 1)
    .limit(limit);

  // Check If Open Days is in Search Params
  let fullData;
  if (searchParams.find((param) => param.key === "hours.day_of_week")) {
    const { data: fullBusinessesData, error: fullBusinessesError } =
      await supabase
        .from("businesses")
        .select(fullBusinessSelect)
        .in(
          "id",
          data.map((business) => business.id)
        );
    if (fullBusinessesError) {
      return { data: null, count, error: fullBusinessesError };
    }

    fullData = data.map((originalBusiness) => {
      return fullBusinessesData.find(
        (fullBusiness) => fullBusiness.id === originalBusiness.id
      );
    });
  } else {
    fullData = data;
  }

  // Format Data
  if (fullData) {
    const formattedData = fullData.map((business) =>
      formatFullBusiness(business)
    );
    return { data: formattedData, count, error };
  }

  return { data: null, count, error };
};

// Location
export const getAllStates = async () => {
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};

export const getAllCities = async (state_id) => {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name", { ascending: true })
    .eq("state_id", state_id);

  return { data, error };
};

export const getAllCitiesList = async () => {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};

export const getAllPostalCodes = async (city_id) => {
  const { data, error } = await supabase
    .from("postal_codes")
    .select("id, code, city_id, city:cities(id, name, state_id)")
    .order("code", { ascending: true })
    .eq("city_id", city_id);

  return { data, error };
};

export const getPostalCodesByState = async (state_id) => {
  const { data, error } = await supabase
    .from("postal_codes")
    .select("id, code, city_id, city:cities!inner(id, name, state_id)")
    .eq("city.state_id", state_id)
    .order("code", { ascending: true });

  return { data, error };
};

// Categories
export const getAllPrimaryCategories = async () => {
  const { data, error } = await supabase
    .from("primary_categories")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};

export const getAllSecondaryCategories = async () => {
  const { data, error } = await supabase
    .from("secondary_categories")
    .select("*")
    .order("name", { ascending: true });

  return { data, error };
};

export const getPrimaryCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("primary_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  return { data, error };
};

export const insertContactMessage = async (payload) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert(payload)
    .select("contact_message_id")
    .single();

  return { data, error };
};

export const getBusinessClaimInfo = async (business_id) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, title, slug, email, phone, is_claimed")
    .eq("id", business_id)
    .single();

  return { data, error };
};

export const insertListingReport = async (payload) => {
  const { data, error } = await supabase
    .from("listing_reports")
    .insert(payload)
    .select("listing_report_id")
    .single();

  return { data, error };
};

export const getListingReports = async (page, limit, status = null) => {
  let query = supabase
    .from("listing_reports")
    .select(
      "listing_report_id, business_id, reason, details, reporter_name, reporter_email, suggested_phone, suggested_email, status, created_at, resolved_at, resolved_by, business:businesses(id, title, slug, address, email, phone, is_claimed)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  return { data, count, error };
};

const ADMIN_BUSINESS_SELECT =
  "id, title, slug, email, phone, address, website, is_claimed, owner_uid, total_score, reviews_count, last_edited_at, created_at, image_url, place_id";

const sanitizeAdminBusinessSearch = (q) => {
  if (!q) return null;
  return q
    .replace(/[%_,.()\"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
};

const getAuthEmailsByUids = async (uids) => {
  const unique = [...new Set((uids ?? []).filter(Boolean))];
  const emailByUid = new Map();

  await Promise.all(
    unique.map(async (uid) => {
      try {
        const { data, error } = await adminAuthClient.getUserById(uid);
        if (!error && data?.user?.email) {
          emailByUid.set(uid, data.user.email);
        }
      } catch {
        // skip missing/deleted auth users
      }
    })
  );

  return emailByUid;
};

const withOwnerEmails = async (businesses) => {
  const rows = businesses ?? [];
  if (!rows.length) return rows;

  const emailByUid = await getAuthEmailsByUids(
    rows.map((row) => row.owner_uid)
  );

  return rows.map((row) => ({
    ...row,
    owner_email: row.owner_uid
      ? (emailByUid.get(row.owner_uid) ?? null)
      : null,
  }));
};

export const getAdminBusinesses = async (
  page,
  limit,
  {
    claimed = null,
    q = null,
    stateCode = null,
    citySlug = null,
    postalCode = null,
    scoreTier = null,
    reviewsTier = null,
    emailFilter = null,
  } = {}
) => {
  let location = null;

  if (stateCode) {
    const { data: state, error: stateError } = await supabase
      .from("states")
      .select("id, name, code")
      .ilike("code", stateCode)
      .maybeSingle();

    if (stateError) return { data: null, count: null, location: null, error: stateError };
    if (!state) {
      return {
        data: [],
        count: 0,
        location: null,
        error: { code: "PGRST116", message: "State not found" },
      };
    }
    location = {
      type: "state",
      id: state.id,
      name: state.name,
      code: state.code,
      slug: String(state.code).toLowerCase(),
    };
  } else if (citySlug) {
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("id, name, slug, state_id, state:states(id, name, code)")
      .eq("slug", citySlug)
      .maybeSingle();

    if (cityError) return { data: null, count: null, location: null, error: cityError };
    if (!city) {
      return {
        data: [],
        count: 0,
        location: null,
        error: { code: "PGRST116", message: "City not found" },
      };
    }
    location = {
      type: "city",
      id: city.id,
      name: city.name,
      slug: city.slug,
      state_id: city.state_id,
      state_name: city.state?.name ?? null,
      state_code: city.state?.code ?? null,
    };
  } else if (postalCode) {
    const { data: postals, error: postalError } = await supabase
      .from("postal_codes")
      .select("id, code, city_id, city:cities(id, name, slug, state:states(id, name, code))")
      .eq("code", postalCode);

    if (postalError) {
      return { data: null, count: null, location: null, error: postalError };
    }
    if (!postals?.length) {
      return {
        data: [],
        count: 0,
        location: null,
        error: { code: "PGRST116", message: "Postal code not found" },
      };
    }

    const primary = postals[0];
    location = {
      type: "postal-code",
      id: primary.id,
      code: primary.code,
      ids: postals.map((p) => p.id),
      city_name: primary.city?.name ?? null,
      city_slug: primary.city?.slug ?? null,
      state_name: primary.city?.state?.name ?? null,
      state_code: primary.city?.state?.code ?? null,
      city_count: new Set(postals.map((p) => p.city_id).filter(Boolean)).size,
    };
  }

  let query = supabase
    .from("businesses")
    .select(ADMIN_BUSINESS_SELECT, { count: "exact" });

  if (claimed === true) {
    query = query
      .eq("is_claimed", true)
      .order("last_edited_at", { ascending: false, nullsFirst: false });
  } else {
    query = query
      .order("total_score", { ascending: false })
      .order("reviews_count", { ascending: false });
  }

  if (location?.type === "state") {
    query = query.eq("state_id", location.id);
  } else if (location?.type === "city") {
    query = query.eq("city_id", location.id);
  } else if (location?.type === "postal-code") {
    query = query.in("postal_code_id", location.ids);
  }

  const scoreBounds = getScoreTier(scoreTier);
  if (scoreBounds) {
    if (scoreBounds.min != null) {
      query = query.gte("total_score", scoreBounds.min);
    }
    if (scoreBounds.max != null) {
      query = query.lt("total_score", scoreBounds.max);
    }
  }

  const reviewsBounds = getReviewTier(reviewsTier);
  if (reviewsBounds) {
    if (reviewsBounds.min != null) {
      query = query.gte("reviews_count", reviewsBounds.min);
    }
    if (reviewsBounds.max != null) {
      query = query.lt("reviews_count", reviewsBounds.max);
    }
  }

  if (emailFilter === "has") {
    query = query.not("email", "is", null).neq("email", "");
  } else if (emailFilter === "none") {
    query = query.or("email.is.null,email.eq.");
  }

  const sanitized = sanitizeAdminBusinessSearch(q);
  if (sanitized) {
    const pattern = `%${sanitized}%`;
    query = query.or(
      `title.ilike."${pattern}",slug.ilike."${pattern}",email.ilike."${pattern}",phone.ilike."${pattern}"`
    );
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    return { data: null, count, location, error };
  }

  if (location?.ids) {
    const { ids, ...rest } = location;
    location = rest;
  }

  const businesses = await withOwnerEmails(data);

  return { data: businesses, count, location, error: null };
};

const EMAIL_CLEANER_BUSINESS_SELECT = "id, title, slug, email";

/**
 * Paginated businesses that have a non-empty email, with outreach emails_sent_count.
 */
export const getAdminBusinessesWithEmails = async (
  page,
  limit,
  { q = null } = {}
) => {
  let query = supabase
    .from("businesses")
    .select(EMAIL_CLEANER_BUSINESS_SELECT, { count: "exact" })
    .not("email", "is", null)
    .neq("email", "")
    .order("title", { ascending: true });

  const sanitized = sanitizeAdminBusinessSearch(q);
  if (sanitized) {
    const pattern = `%${sanitized}%`;
    query = query.or(
      `title.ilike."${pattern}",slug.ilike."${pattern}",email.ilike."${pattern}"`
    );
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    return { data: null, count, error };
  }

  const rows = data ?? [];
  const ids = rows.map((row) => row.id);
  const emailsSentByBusinessId = new Map();

  if (ids.length) {
    const { data: historyRows, error: historyError } = await supabase
      .from("outreach_history")
      .select("business_id")
      .in("business_id", ids);

    if (historyError) {
      return { data: null, count, error: historyError };
    }

    for (const row of historyRows ?? []) {
      if (!row?.business_id) continue;
      emailsSentByBusinessId.set(
        row.business_id,
        (emailsSentByBusinessId.get(row.business_id) ?? 0) + 1
      );
    }
  }

  const businesses = rows.map((row) => ({
    ...row,
    emails_sent_count: emailsSentByBusinessId.get(row.id) ?? 0,
  }));

  return { data: businesses, count, error: null };
};

/**
 * Set business email to null for the given IDs (admin email cleaner).
 */
export const clearBusinessEmails = async (ids) => {
  if (!ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("businesses")
    .update({ email: null })
    .in("id", ids)
    .not("email", "is", null)
    .select("id");

  return { data, error };
};

/**
 * Update a single business email (admin email cleaner).
 */
export const updateBusinessEmail = async (id, email) => {
  const { data, error } = await supabase
    .from("businesses")
    .update({ email })
    .eq("id", id)
    .select("id, title, slug, email")
    .single();

  return { data, error };
};

/**
 * Reverse claims for the given business IDs (admin claimed businesses).
 * Sets is_claimed=false and owner_uid=null.
 */
export const unclaimBusinessesByIds = async (ids) => {
  if (!ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("businesses")
    .update({
      owner_uid: null,
      is_claimed: false,
    })
    .in("id", ids)
    .eq("is_claimed", true)
    .select("id, slug");

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
};

const ADMIN_LOCATION_PAGE_SIZE = 1000;

const fetchAllAdminRows = async (table, selectCols) => {
  const rows = [];
  let start = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(selectCols)
      .range(start, start + ADMIN_LOCATION_PAGE_SIZE - 1);

    if (error) return { data: null, error };

    rows.push(...(data ?? []));
    if (!data || data.length < ADMIN_LOCATION_PAGE_SIZE) break;
    start += ADMIN_LOCATION_PAGE_SIZE;
  }

  return { data: rows, error: null };
};

const countExact = async (query) => {
  const { count, error } = await query;
  if (error) return { count: 0, error };
  return { count: count ?? 0, error: null };
};

const OUTREACH_TYPE_STAT_LABELS = {
  claim_invite: "Claim invite (website)",
  ownership_claim_invite: "Claim invite (ownership)",
  lead_claim_invite: "Claim invite (leads)",
  claim_followup: "Claim follow-up",
  website_offer: "Website offer",
};

const CLAIM_ELIGIBILITY_STAT_LABELS = {
  able: "Able",
  no_email: "No email",
  duplicate_email: "Duplicate email",
  claimed: "Claimed",
};

/**
 * Overview dashboard pie-chart stats: email/website coverage, claim eligibility,
 * and outreach emails by type.
 */
export const getAdminDashboardStats = async () => {
  const [
    totalRes,
    withEmailRes,
    withoutEmailRes,
    withWebsiteRes,
    withoutWebsiteRes,
    ableRes,
    noEmailRes,
    duplicateEmailRes,
    claimedRes,
    claimInviteRes,
    ownershipClaimRes,
    leadClaimRes,
    claimFollowupRes,
    websiteOfferRes,
  ] = await Promise.all([
    countExact(
      supabase.from("businesses").select("id", { count: "exact", head: true })
    ),
    countExact(
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .not("email", "is", null)
        .neq("email", "")
    ),
    countExact(
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .or("email.is.null,email.eq.")
    ),
    countExact(
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .not("website", "is", null)
        .neq("website", "")
    ),
    countExact(
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .or("website.is.null,website.eq.")
    ),
    countExact(
      supabase
        .from("outreach_business_list")
        .select("id", { count: "exact", head: true })
        .eq("claim_eligibility", "able")
    ),
    countExact(
      supabase
        .from("outreach_business_list")
        .select("id", { count: "exact", head: true })
        .eq("claim_eligibility", "no_email")
    ),
    countExact(
      supabase
        .from("outreach_business_list")
        .select("id", { count: "exact", head: true })
        .eq("claim_eligibility", "duplicate_email")
    ),
    countExact(
      supabase
        .from("outreach_business_list")
        .select("id", { count: "exact", head: true })
        .eq("claim_eligibility", "claimed")
    ),
    countExact(
      supabase
        .from("outreach_history")
        .select("outreach_history_id", { count: "exact", head: true })
        .eq("outreach_type", "claim_invite")
    ),
    countExact(
      supabase
        .from("outreach_history")
        .select("outreach_history_id", { count: "exact", head: true })
        .eq("outreach_type", "ownership_claim_invite")
    ),
    countExact(
      supabase
        .from("outreach_history")
        .select("outreach_history_id", { count: "exact", head: true })
        .eq("outreach_type", "lead_claim_invite")
    ),
    countExact(
      supabase
        .from("outreach_history")
        .select("outreach_history_id", { count: "exact", head: true })
        .eq("outreach_type", "claim_followup")
    ),
    countExact(
      supabase
        .from("outreach_history")
        .select("outreach_history_id", { count: "exact", head: true })
        .eq("outreach_type", "website_offer")
    ),
  ]);

  const firstError =
    totalRes.error ||
    withEmailRes.error ||
    withoutEmailRes.error ||
    withWebsiteRes.error ||
    withoutWebsiteRes.error ||
    ableRes.error ||
    noEmailRes.error ||
    duplicateEmailRes.error ||
    claimedRes.error ||
    claimInviteRes.error ||
    ownershipClaimRes.error ||
    leadClaimRes.error ||
    claimFollowupRes.error ||
    websiteOfferRes.error;

  if (firstError) {
    return { data: null, error: firstError };
  }

  const emailSlices = [
    {
      key: "with_email",
      label: "With email",
      count: withEmailRes.count,
    },
    {
      key: "without_email",
      label: "No email",
      count: withoutEmailRes.count,
    },
  ].filter((slice) => slice.count > 0);

  const websiteSlices = [
    {
      key: "with_website",
      label: "With website",
      count: withWebsiteRes.count,
    },
    {
      key: "without_website",
      label: "No website",
      count: withoutWebsiteRes.count,
    },
  ].filter((slice) => slice.count > 0);

  const claimEligibilitySlices = [
    {
      key: "able",
      label: CLAIM_ELIGIBILITY_STAT_LABELS.able,
      count: ableRes.count,
    },
    {
      key: "no_email",
      label: CLAIM_ELIGIBILITY_STAT_LABELS.no_email,
      count: noEmailRes.count,
    },
    {
      key: "duplicate_email",
      label: CLAIM_ELIGIBILITY_STAT_LABELS.duplicate_email,
      count: duplicateEmailRes.count,
    },
    {
      key: "claimed",
      label: CLAIM_ELIGIBILITY_STAT_LABELS.claimed,
      count: claimedRes.count,
    },
  ].filter((slice) => slice.count > 0);

  const emailsSentSlices = [
    {
      key: "claim_invite",
      label: OUTREACH_TYPE_STAT_LABELS.claim_invite,
      count: claimInviteRes.count,
    },
    {
      key: "ownership_claim_invite",
      label: OUTREACH_TYPE_STAT_LABELS.ownership_claim_invite,
      count: ownershipClaimRes.count,
    },
    {
      key: "lead_claim_invite",
      label: OUTREACH_TYPE_STAT_LABELS.lead_claim_invite,
      count: leadClaimRes.count,
    },
    {
      key: "claim_followup",
      label: OUTREACH_TYPE_STAT_LABELS.claim_followup,
      count: claimFollowupRes.count,
    },
    {
      key: "website_offer",
      label: OUTREACH_TYPE_STAT_LABELS.website_offer,
      count: websiteOfferRes.count,
    },
  ].filter((slice) => slice.count > 0);

  const emailsSentTotal = emailsSentSlices.reduce(
    (sum, slice) => sum + slice.count,
    0
  );

  return {
    data: {
      email: {
        total: totalRes.count,
        slices: emailSlices,
      },
      website: {
        total: totalRes.count,
        slices: websiteSlices,
      },
      claim_eligibility: {
        total: totalRes.count,
        slices: claimEligibilitySlices,
      },
      emails_sent: {
        total: emailsSentTotal,
        slices: emailsSentSlices,
      },
    },
    error: null,
  };
};

const roundPercent = (count, total) => {
  if (!total || total <= 0) return 0;
  return Math.round((count / total) * 10000) / 100;
};

const matchesLocationSearch = (haystacks, q) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return haystacks.some(
    (value) => typeof value === "string" && value.toLowerCase().includes(needle)
  );
};

const sortByBusinessCountThenName = (a, b, nameKey = "name", direction = "desc") => {
  const diff =
    direction === "asc"
      ? a.business_count - b.business_count
      : b.business_count - a.business_count;
  if (diff !== 0) return diff;
  return String(a[nameKey] ?? "").localeCompare(String(b[nameKey] ?? ""));
};

export const sortAdminLocations = (rows, tab, sort = "businesses_desc") => {
  const direction = sort === "businesses_asc" ? "asc" : "desc";
  const nameKey = tab === "postal-codes" ? "code" : "name";
  return [...(rows ?? [])].sort((a, b) =>
    sortByBusinessCountThenName(a, b, nameKey, direction)
  );
};

/**
 * Aggregates business counts for states, cities, and postal codes.
 * Returns the full list for one tab (caller paginates / searches).
 */
export const getAdminLocationAggregates = async (tab) => {
  const [statesRes, citiesRes, postalRes, businessesRes] = await Promise.all([
    fetchAllAdminRows("states", "id, name, code"),
    fetchAllAdminRows("cities", "id, name, slug, state_id"),
    fetchAllAdminRows("postal_codes", "id, code, city_id"),
    fetchAllAdminRows("businesses", "state_id, city_id, postal_code_id"),
  ]);

  const firstError =
    statesRes.error ||
    citiesRes.error ||
    postalRes.error ||
    businessesRes.error;
  if (firstError) {
    return { data: null, error: firstError };
  }

  const states = statesRes.data ?? [];
  const cities = citiesRes.data ?? [];
  const postalCodes = postalRes.data ?? [];
  const businesses = businessesRes.data ?? [];
  const totalBusinesses = businesses.length;

  const stateById = new Map(states.map((s) => [s.id, s]));
  const cityById = new Map(cities.map((c) => [c.id, c]));

  const businessCountByState = new Map();
  const businessCountByCity = new Map();
  const businessCountByPostal = new Map();

  for (const biz of businesses) {
    if (biz.state_id) {
      businessCountByState.set(
        biz.state_id,
        (businessCountByState.get(biz.state_id) ?? 0) + 1
      );
    }
    if (biz.city_id) {
      businessCountByCity.set(
        biz.city_id,
        (businessCountByCity.get(biz.city_id) ?? 0) + 1
      );
    }
    if (biz.postal_code_id) {
      businessCountByPostal.set(
        biz.postal_code_id,
        (businessCountByPostal.get(biz.postal_code_id) ?? 0) + 1
      );
    }
  }

  const cityCountByState = new Map();
  const postalCountByState = new Map();
  const postalCountByCity = new Map();

  for (const city of cities) {
    cityCountByState.set(
      city.state_id,
      (cityCountByState.get(city.state_id) ?? 0) + 1
    );
  }

  for (const postal of postalCodes) {
    postalCountByCity.set(
      postal.city_id,
      (postalCountByCity.get(postal.city_id) ?? 0) + 1
    );
    const city = cityById.get(postal.city_id);
    if (city?.state_id) {
      postalCountByState.set(
        city.state_id,
        (postalCountByState.get(city.state_id) ?? 0) + 1
      );
    }
  }

  if (tab === "states") {
    const data = states
      .map((state) => {
        const business_count = businessCountByState.get(state.id) ?? 0;
        return {
          id: state.id,
          name: state.name,
          code: state.code,
          business_count,
          percentage: roundPercent(business_count, totalBusinesses),
          city_count: cityCountByState.get(state.id) ?? 0,
          postal_code_count: postalCountByState.get(state.id) ?? 0,
          slug: String(state.code ?? "").toLowerCase(),
        };
      })
      .sort((a, b) => sortByBusinessCountThenName(a, b, "name"));

    return { data, totalBusinesses, error: null };
  }

  if (tab === "cities") {
    const data = cities
      .map((city) => {
        const state = stateById.get(city.state_id);
        const business_count = businessCountByCity.get(city.id) ?? 0;
        const stateBusinessCount = businessCountByState.get(city.state_id) ?? 0;
        return {
          id: city.id,
          name: city.name,
          slug: city.slug,
          state_id: city.state_id,
          state_name: state?.name ?? null,
          state_code: state?.code ?? null,
          business_count,
          percentage: roundPercent(business_count, stateBusinessCount),
          postal_code_count: postalCountByCity.get(city.id) ?? 0,
        };
      })
      .sort((a, b) => sortByBusinessCountThenName(a, b, "name"));

    return { data, totalBusinesses, error: null };
  }

  const data = postalCodes
    .map((postal) => {
      const city = cityById.get(postal.city_id);
      const state = city ? stateById.get(city.state_id) : null;
      const business_count = businessCountByPostal.get(postal.id) ?? 0;
      const cityBusinessCount = businessCountByCity.get(postal.city_id) ?? 0;
      return {
        id: postal.id,
        code: postal.code,
        city_id: postal.city_id,
        city_name: city?.name ?? null,
        state_id: city?.state_id ?? null,
        state_name: state?.name ?? null,
        state_code: state?.code ?? null,
        business_count,
        percentage: roundPercent(business_count, cityBusinessCount),
      };
    })
    .sort((a, b) => sortByBusinessCountThenName(a, b, "code"));

  return { data, totalBusinesses, error: null };
};

export const filterAdminLocations = (
  rows,
  tab,
  q,
  { stateId = null, cityId = null } = {}
) => {
  let filtered = rows ?? [];

  if (stateId && (tab === "cities" || tab === "postal-codes")) {
    filtered = filtered.filter((row) => row.state_id === stateId);
  }

  if (cityId && tab === "postal-codes") {
    filtered = filtered.filter((row) => row.city_id === cityId);
  }

  const sanitized = sanitizeAdminBusinessSearch(q);
  if (!sanitized) return filtered;

  return filtered.filter((row) => {
    if (tab === "states") {
      return matchesLocationSearch([row.name, row.code], sanitized);
    }
    if (tab === "cities") {
      return matchesLocationSearch([row.name, row.slug], sanitized);
    }
    return matchesLocationSearch([row.code], sanitized);
  });
};

const CHART_TOP_SLICES = 4;

/**
 * Top N locations by business count, plus an "Other" bucket for the rest.
 */
export const buildAdminLocationChart = (rows, tab) => {
  const list = sortAdminLocations(rows, tab, "businesses_desc");
  const totalBusinesses = list.reduce(
    (sum, row) => sum + (row.business_count ?? 0),
    0
  );

  const ranked = list.filter((row) => (row.business_count ?? 0) > 0);
  const top = ranked.slice(0, CHART_TOP_SLICES);
  const rest = ranked.slice(CHART_TOP_SLICES);
  const otherBusinesses = rest.reduce(
    (sum, row) => sum + (row.business_count ?? 0),
    0
  );

  const labelOf = (row) => {
    if (tab === "postal-codes") return row.code ?? "Unknown";
    return row.name ?? "Unknown";
  };

  const slices = top.map((row, index) => ({
    key: `slice${index}`,
    label: labelOf(row),
    businesses: row.business_count,
  }));

  if (otherBusinesses > 0) {
    slices.push({
      key: "other",
      label: "Other",
      businesses: otherBusinesses,
    });
  }

  return {
    slices,
    total_businesses: totalBusinesses,
  };
};

/**
 * Businesses whose city_id does not match the city on their postal_code_id.
 */
export const getAdminLocationDataIssues = async () => {
  const [citiesRes, postalRes, businessesRes, statesRes] = await Promise.all([
    fetchAllAdminRows("cities", "id, name, slug, state_id"),
    fetchAllAdminRows("postal_codes", "id, code, city_id"),
    fetchAllAdminRows(
      "businesses",
      "id, title, slug, city_id, state_id, postal_code_id"
    ),
    fetchAllAdminRows("states", "id, name, code"),
  ]);

  const firstError =
    citiesRes.error ||
    postalRes.error ||
    businessesRes.error ||
    statesRes.error;
  if (firstError) {
    return { data: null, error: firstError };
  }

  const stateById = new Map((statesRes.data ?? []).map((s) => [s.id, s]));
  const cityById = new Map((citiesRes.data ?? []).map((c) => [c.id, c]));
  const postalById = new Map((postalRes.data ?? []).map((p) => [p.id, p]));

  const issues = [];
  for (const business of businessesRes.data ?? []) {
    if (!business.postal_code_id || !business.city_id) continue;
    const postal = postalById.get(business.postal_code_id);
    if (!postal) continue;
    if (postal.city_id === business.city_id) continue;

    const businessCity = cityById.get(business.city_id);
    const postalCity = cityById.get(postal.city_id);
    const businessState = businessCity
      ? stateById.get(businessCity.state_id)
      : stateById.get(business.state_id);
    const postalState = postalCity
      ? stateById.get(postalCity.state_id)
      : null;

    const businessCityName = businessCity?.name ?? null;
    const postalCityName = postalCity?.name ?? null;

    issues.push({
      id: business.id,
      business_id: business.id,
      title: business.title,
      slug: business.slug,
      business_city_id: business.city_id,
      business_city_name: businessCityName,
      business_state_id: businessCity?.state_id ?? business.state_id ?? null,
      business_state_name: businessState?.name ?? null,
      business_state_code: businessState?.code ?? null,
      postal_code_id: postal.id,
      postal_code: postal.code,
      postal_city_id: postal.city_id,
      postal_city_name: postalCityName,
      postal_state_id: postalCity?.state_id ?? null,
      postal_state_name: postalState?.name ?? null,
      postal_state_code: postalState?.code ?? null,
      same_city_name:
        Boolean(businessCityName) &&
        Boolean(postalCityName) &&
        businessCityName.toLowerCase() === postalCityName.toLowerCase(),
    });
  }

  issues.sort((a, b) => {
    const byState = String(a.business_state_code ?? "").localeCompare(
      String(b.business_state_code ?? "")
    );
    if (byState !== 0) return byState;
    const byCity = String(a.business_city_name ?? "").localeCompare(
      String(b.business_city_name ?? "")
    );
    if (byCity !== 0) return byCity;
    return String(a.title ?? "").localeCompare(String(b.title ?? ""));
  });

  return { data: issues, error: null };
};

export const filterAdminLocationDataIssues = (rows, q) => {
  const sanitized = sanitizeAdminBusinessSearch(q);
  if (!sanitized) return rows ?? [];

  return (rows ?? []).filter((row) =>
    matchesLocationSearch(
      [
        row.title,
        row.slug,
        row.business_city_name,
        row.business_state_name,
        row.business_state_code,
        row.postal_code,
        row.postal_city_name,
        row.postal_state_name,
        row.postal_state_code,
      ],
      sanitized
    )
  );
};

export const updateListingReportsStatus = async (
  ids,
  status,
  resolvedBy = "admin"
) => {
  if (!ids?.length) return { data: [], error: null };

  const patch =
    status === "pending"
      ? {
          status,
          resolved_at: null,
          resolved_by: null,
        }
      : {
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
        };

  const { data, error } = await supabase
    .from("listing_reports")
    .update(patch)
    .in("listing_report_id", ids)
    .select("listing_report_id");

  return { data, error };
};

/**
 * True when the same email appears on 2+ businesses.
 * Shared corporate inboxes cannot be used for self-serve claim until phone
 * verification exists.
 */
export const isBusinessEmailShared = async (email) => {
  const trimmed = typeof email === "string" ? email.trim() : "";
  if (!trimmed) {
    return { isShared: false, error: null };
  }

  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("email", trimmed);

  if (error) {
    return { isShared: false, error };
  }

  return { isShared: (count ?? 0) > 1, error: null };
};

export const getPendingClaimRequest = async (business_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .select("claim_request_id, last_attempted_at")
    .eq("business_id", business_id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  return { data, error };
};

export const getPendingClaimRequestsForBusiness = async (business_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .select("claim_request_id, last_attempted_at")
    .eq("business_id", business_id)
    .eq("status", "pending");

  return { data, error };
};

export const expireClaimRequestsByIds = async (claim_request_ids) => {
  if (!claim_request_ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("claim_requests")
    .update({ status: "expired" })
    .in("claim_request_id", claim_request_ids)
    .select("claim_request_id");

  return { data, error };
};

export const getClaimRequests = async (page, limit, status = null) => {
  let query = supabase
    .from("claim_requests")
    .select(
      "claim_request_id, business_id, status, attempts, last_attempted_at, created_at, completed_by, completed_at, business:businesses(id, title, slug)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  return { data, count, error };
};

export const updateClaimRequestsStatus = async (ids, status) => {
  if (!ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("claim_requests")
    .update({ status })
    .in("claim_request_id", ids)
    .select("claim_request_id");

  return { data, error };
};

export const insertClaimRequest = async (business_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .insert({ business_id })
    .select("claim_request_id")
    .single();

  return { data, error };
};

export const updateClaimRequestStatus = async (claim_request_id, status) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .update({ status })
    .eq("claim_request_id", claim_request_id)
    .select("claim_request_id")
    .single();

  return { data, error };
};

export const getClaimRequestWithBusiness = async (claim_request_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .select(
      "claim_request_id, business_id, status, attempts, last_attempted_at, business:businesses(id, title, slug, email, is_claimed)"
    )
    .eq("claim_request_id", claim_request_id)
    .maybeSingle();

  return { data, error };
};

export const deleteClaimRequest = async (claim_request_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .delete()
    .eq("claim_request_id", claim_request_id)
    .select("claim_request_id")
    .single();

  return { data, error };
};

export const resetClaimAttempts = async (claim_request_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .update({
      attempts: 0,
      last_attempted_at: new Date().toISOString(),
    })
    .eq("claim_request_id", claim_request_id)
    .select("claim_request_id, attempts, last_attempted_at")
    .single();

  return { data, error };
};

export const incrementClaimAttempts = async (claim_request_id, currentAttempts) => {
  const nextAttempts = Number(currentAttempts || 0) + 1;
  const { data, error } = await supabase
    .from("claim_requests")
    .update({
      attempts: nextAttempts,
      last_attempted_at: new Date().toISOString(),
    })
    .eq("claim_request_id", claim_request_id)
    .select("claim_request_id, attempts, last_attempted_at")
    .single();

  return { data, error };
};

export const completeBusinessClaimRpc = async (
  claim_request_id,
  business_id,
  uid
) => {
  const { data, error } = await supabase.rpc("complete_business_claim", {
    p_claim_request_id: claim_request_id,
    p_business_id: business_id,
    p_uid: uid,
  });

  return { data, error };
};

export const createAuthUser = async ({ email, password }) => {
  const { data, error } = await adminAuthClient.createUser({
    email,
    password,
    email_confirm: true,
  });

  return { data, error };
};

export const deleteAuthUser = async (uid) => {
  const { data, error } = await adminAuthClient.deleteUser(uid);
  return { data, error };
};

export const unclaimBusinessesByOwnerUid = async (ownerUid) => {
  if (!ownerUid || typeof ownerUid !== "string") {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("businesses")
    .update({
      owner_uid: null,
      is_claimed: false,
    })
    .eq("owner_uid", ownerUid)
    .select("id, slug");

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
};

export const deletePublicUserByUid = async (uid) => {
  if (!uid || typeof uid !== "string") {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("uid", uid)
    .select("uid")
    .maybeSingle();

  return { data, error };
};

/**
 * Paginated app users (public.users) with auth email + claimed business count.
 */
export const getAdminUsers = async (page, limit) => {
  const { data, count, error } = await supabase
    .from("users")
    .select("uid, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return { data: null, count, error };
  }

  const rows = data ?? [];
  const uids = rows.map((row) => row.uid).filter(Boolean);
  const emailByUid = await getAuthEmailsByUids(uids);
  const claimedByUid = new Map();

  if (uids.length) {
    const { data: claimedRows, error: claimedError } = await supabase
      .from("businesses")
      .select("owner_uid")
      .in("owner_uid", uids)
      .eq("is_claimed", true);

    if (claimedError) {
      return { data: null, count, error: claimedError };
    }

    for (const row of claimedRows ?? []) {
      if (!row?.owner_uid) continue;
      claimedByUid.set(
        row.owner_uid,
        (claimedByUid.get(row.owner_uid) ?? 0) + 1
      );
    }
  }

  const users = rows.map((row) => ({
    uid: row.uid,
    email: emailByUid.get(row.uid) ?? null,
    role: row.role ?? null,
    created_at: row.created_at ?? null,
    claimed_count: claimedByUid.get(row.uid) ?? 0,
  }));

  return { data: users, count, error: null };
};

/**
 * Delete app users: unclaim businesses, delete auth user, clean public.users.
 * Returns { deleted, unclaimedBusinesses, errors }.
 */
export const deleteAdminUsers = async (uids) => {
  if (!uids?.length) {
    return { deleted: [], unclaimedBusinesses: [], errors: [] };
  }

  const deleted = [];
  const unclaimedBusinesses = [];
  const errors = [];

  for (const uid of uids) {
    const { data: unclaimed, error: unclaimError } =
      await unclaimBusinessesByOwnerUid(uid);

    if (unclaimError) {
      errors.push({ uid, message: unclaimError.message || "Failed to unclaim" });
      continue;
    }

    unclaimedBusinesses.push(...(unclaimed ?? []));

    const { error: deleteAuthError } = await deleteAuthUser(uid);
    if (deleteAuthError) {
      errors.push({
        uid,
        message: deleteAuthError.message || "Failed to delete auth user",
      });
      continue;
    }

    try {
      await deletePublicUserByUid(uid);
    } catch {
      // best-effort; auth delete cascades public.users
    }

    deleted.push(uid);
  }

  return { deleted, unclaimedBusinesses, errors };
};

export const signInWithPassword = async ({ email, password }) => {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const getAuthUserByAccessToken = async (accessToken) => {
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  return { data, error };
};

export const getClaimedBusinessByOwnerUid = async (ownerUid) => {
  if (!ownerUid || typeof ownerUid !== "string") {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, title, email, is_claimed, last_edited_at")
    .eq("owner_uid", ownerUid)
    .eq("is_claimed", true)
    .order("last_edited_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data?.slug) {
    return { data: null, error: null };
  }

  return {
    data: {
      id: data.id,
      slug: data.slug,
      title: data.title,
      email: data.email,
      last_edited_at: data.last_edited_at,
    },
    error: null,
  };
};

export const updateAuthUserEmail = async (accessToken, email, emailRedirectTo) => {
  if (!accessToken) {
    return { data: null, error: { message: "Missing access token." } };
  }

  const params = new URLSearchParams();
  if (emailRedirectTo) {
    params.set("redirect_to", emailRedirectTo);
  }
  const query = params.toString();
  const url = `${supabaseUrl}/auth/v1/user${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        payload?.msg ||
        payload?.error_description ||
        payload?.message ||
        "Unable to update email.";
      return {
        data: null,
        error: {
          message,
          status: response.status,
          code: payload?.error_code || payload?.code,
        },
      };
    }

    return { data: { user: payload }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateAuthUserPassword = async (
  accessToken,
  { password, currentPassword }
) => {
  if (!accessToken) {
    return { data: null, error: { message: "Missing access token." } };
  }

  const url = `${supabaseUrl}/auth/v1/user`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        current_password: currentPassword,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        payload?.msg ||
        payload?.error_description ||
        payload?.message ||
        "Unable to update password.";
      return {
        data: null,
        error: {
          message,
          status: response.status,
          code: payload?.error_code || payload?.code,
        },
      };
    }

    return { data: { user: payload }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getOwnedBusinesses = async (ownerUid, accessToken) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .select(
      "id, title, slug, address, image_url, place_id, cdn_stored, last_edited_at"
    )
    .eq("owner_uid", ownerUid)
    .eq("is_claimed", true)
    .order("last_edited_at", { ascending: false, nullsFirst: false });

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
};

export const getOwnedBusiness = async (businessId, ownerUid, accessToken) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .select(
      "id, owner_uid, phone, email, website, description, last_edited_at, is_claimed"
    )
    .eq("id", businessId)
    .eq("owner_uid", ownerUid)
    .maybeSingle();

  return { data, error };
};

export const updateOwnedBusinessContact = async (
  businessId,
  ownerUid,
  { phone, email, website },
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .update({
      phone,
      email,
      website,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .eq("owner_uid", ownerUid)
    .select("id, phone, email, website, last_edited_at")
    .maybeSingle();

  return { data, error };
};

export const updateOwnedBusinessPrimaryCategory = async (
  businessId,
  primaryCategoryId,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .update({
      primary_category_id: primaryCategoryId,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .select("id, primary_category_id, last_edited_at")
    .maybeSingle();

  return { data, error };
};

export const updateOwnedBusinessAmenities = async (
  businessId,
  features,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("business_features")
    .update({
      appointments_recommended: Boolean(features.appointments_recommended),
      credit_cards: Boolean(features.credit_cards),
      debit_cards: Boolean(features.debit_cards),
      mechanic: Boolean(features.mechanic),
      nfc_mobile_payments: Boolean(features.nfc_mobile_payments),
      oil_change: Boolean(features.oil_change),
      onsite_services: Boolean(features.onsite_services),
      restroom: Boolean(features.restroom),
      wheelchair_accessible: Boolean(features.wheelchair_accessible),
    })
    .eq("business_id", businessId)
    .select(
      "business_id, appointments_recommended, credit_cards, debit_cards, mechanic, nfc_mobile_payments, oil_change, onsite_services, restroom, wheelchair_accessible"
    )
    .maybeSingle();

  return { data, error };
};

export const updateOwnedBusinessAbout = async (
  businessId,
  ownerUid,
  description,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .update({
      description,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .eq("owner_uid", ownerUid)
    .select("id, description, last_edited_at")
    .maybeSingle();

  return { data, error };
};

export const updateOwnedBusinessHours = async (
  businessId,
  days,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const updatedDays = [];

  for (const day of days) {
    const { data, error } = await client
      .from("business_hours")
      .update({
        is_closed: day.is_closed,
        hours: day.hours,
        hours_text: day.hours_text,
      })
      .eq("business_id", businessId)
      .eq("day_of_week", day.day_of_week)
      .select("id, business_id, day_of_week, is_closed, hours, hours_text")
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return {
        data: null,
        error: {
          message: `Hours row for ${day.day_of_week} was not found.`,
        },
      };
    }

    updatedDays.push(data);
  }

  return { data: updatedDays, error: null };
};

export const getOwnedBusinessSecondaryCategoryIds = async (
  businessId,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("business_secondary_categories")
    .select("secondary_category_id")
    .eq("business_id", businessId);

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) => row.secondary_category_id),
    error: null,
  };
};

export const syncOwnedBusinessSecondaryCategories = async (
  businessId,
  nextIds,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const uniqueNext = [...new Set(nextIds ?? [])];

  const { data: currentIds, error: currentError } =
    await getOwnedBusinessSecondaryCategoryIds(businessId, accessToken);

  if (currentError) {
    return { data: null, error: currentError };
  }

  const currentSet = new Set(currentIds ?? []);
  const nextSet = new Set(uniqueNext);

  const toDelete = [...currentSet].filter((id) => !nextSet.has(id));
  const toInsert = [...nextSet].filter((id) => !currentSet.has(id));

  if (toDelete.length > 0) {
    const { data: deletedRows, error: deleteError } = await client
      .from("business_secondary_categories")
      .delete()
      .eq("business_id", businessId)
      .in("secondary_category_id", toDelete)
      .select("secondary_category_id");

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    // RLS can return success with 0 rows deleted when DELETE is not allowed.
    if ((deletedRows?.length ?? 0) !== toDelete.length) {
      return {
        data: null,
        error: {
          message:
            "Unable to remove one or more secondary categories. Check ownership permissions.",
        },
      };
    }
  }

  if (toInsert.length > 0) {
    const { data: insertedRows, error: insertError } = await client
      .from("business_secondary_categories")
      .insert(
        toInsert.map((secondary_category_id) => ({
          business_id: businessId,
          secondary_category_id,
        }))
      )
      .select("secondary_category_id");

    if (insertError) {
      return { data: null, error: insertError };
    }

    if ((insertedRows?.length ?? 0) !== toInsert.length) {
      return {
        data: null,
        error: {
          message:
            "Unable to add one or more secondary categories. Check ownership permissions.",
        },
      };
    }
  }

  return {
    data: {
      secondaryCategoryIds: uniqueNext,
      added: toInsert.length,
      removed: toDelete.length,
    },
    error: null,
  };
};

export const touchOwnedBusinessEditedAt = async (
  businessId,
  ownerUid,
  accessToken
) => {
  const client = createUserSupabaseClient(accessToken);
  const { data, error } = await client
    .from("businesses")
    .update({
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .eq("owner_uid", ownerUid)
    .select("id, last_edited_at")
    .maybeSingle();

  return { data, error };
};

export const formatAuthSession = (session) => {
  if (!session?.access_token || !session?.refresh_token) {
    return null;
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? null,
  };
};

export const getContactMessages = async (
  page,
  limit,
  status = null,
  archived = false
) => {
  let query = supabase
    .from("contact_messages")
    .select("*, business:businesses(*)", { count: "exact" })
    .eq("archived", archived)
    .order("created_at", { ascending: false });

  if (status === "result") {
    query = query.in("status", ["responded", "declined", "no_response"]);
  } else if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  return { data, count, error };
};

export const updateContactMessagesStatus = async (ids, status) => {
  const payload = { status };
  if (status === "sent") {
    payload.send_method = "manual";
    payload.sent_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .update(payload)
    .in("contact_message_id", ids)
    .neq("status", "sent")
    .select("contact_message_id");

  return { data, error };
};

export const updateContactMessagesArchived = async (ids, archived) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ archived })
    .in("contact_message_id", ids)
    .select("contact_message_id");

  return { data, error };
};

export const markContactMessagesConfirmed = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      confirmation_sent: true,
      confirmation_sent_at: new Date().toISOString(),
    })
    .in("contact_message_id", ids)
    .eq("confirmation_sent", false)
    .select("contact_message_id, confirmation_sent_at");

  return { data, error };
};

export const getContactMessagesByIds = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select(
      "*, business:businesses(id, email, title, slug, address, city_id, postal_code_id, is_claimed)"
    )
    .in("contact_message_id", ids);

  return { data, error };
};

export const getNearbyBusinessRecommendations = async ({
  excludeBusinessId,
  cityId,
  postalCodeId,
  limit = 3,
}) => {
  if (!cityId && !postalCodeId) {
    return { data: [], error: null };
  }

  const orFilters = [];
  if (postalCodeId) {
    orFilters.push(`postal_code_id.eq.${postalCodeId}`);
  }
  if (cityId) {
    orFilters.push(`city_id.eq.${cityId}`);
  }

  let query = supabase
    .from("businesses")
    .select("id, title, address, total_score, slug")
    .or(orFilters.join(","))
    .order("total_score", { ascending: false })
    .limit(limit);

  if (excludeBusinessId) {
    query = query.neq("id", excludeBusinessId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const markContactMessagesDeclined = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      status: "declined",
      declined_at: new Date().toISOString(),
    })
    .in("contact_message_id", ids)
    .eq("status", "sent")
    .eq("confirmation_sent", true)
    .select("contact_message_id, declined_at");

  return { data, error };
};

export const markContactMessagesResponded = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      status: "responded",
      responded_at: new Date().toISOString(),
    })
    .in("contact_message_id", ids)
    .eq("status", "sent")
    .eq("confirmation_sent", true)
    .select("contact_message_id, responded_at");

  return { data, error };
};

export const markContactMessagesNoResponse = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status: "no_response" })
    .in("contact_message_id", ids)
    .eq("status", "sent")
    .eq("confirmation_sent", true)
    .select("contact_message_id");

  return { data, error };
};

export const markContactMessagesSent = async (ids) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      status: "sent",
      send_method: "auto",
      sent_at: new Date().toISOString(),
    })
    .in("contact_message_id", ids)
    .select("contact_message_id");

  return { data, error };
};

/** Mark as auto-sent and customer confirmation already delivered. */
export const markContactMessagesSentAndConfirmed = async (ids) => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      status: "sent",
      send_method: "auto",
      sent_at: now,
      confirmation_sent: true,
      confirmation_sent_at: now,
    })
    .in("contact_message_id", ids)
    .select("contact_message_id");

  return { data, error };
};

const OUTREACH_LIST_SELECT =
  "id, title, slug, email, phone, website, is_claimed, owner_uid, total_score, reviews_count, created_at, claim_eligibility, claim_invite_sent_at, website_offer_sent_at, claim_followup_sent_at";

const applyOutreachBusinessFilters = (
  query,
  {
    q = null,
    claimEligibility = null,
    websiteFilter = null,
    claimInviteSent = null,
    websiteOfferSent = null,
    claimFollowupSent = null,
  } = {}
) => {
  let next = query;

  if (claimEligibility) {
    if (Array.isArray(claimEligibility)) {
      next = next.in("claim_eligibility", claimEligibility);
    } else {
      next = next.eq("claim_eligibility", claimEligibility);
    }
  }

  if (websiteFilter === "has") {
    next = next.not("website", "is", null).neq("website", "");
  } else if (websiteFilter === "none") {
    next = next.or("website.is.null,website.eq.");
  }

  if (claimInviteSent === true) {
    next = next.not("claim_invite_sent_at", "is", null);
  } else if (claimInviteSent === false) {
    next = next.is("claim_invite_sent_at", null);
  }

  if (websiteOfferSent === true) {
    next = next.not("website_offer_sent_at", "is", null);
  } else if (websiteOfferSent === false) {
    next = next.is("website_offer_sent_at", null);
  }

  if (claimFollowupSent === true) {
    next = next.not("claim_followup_sent_at", "is", null);
  } else if (claimFollowupSent === false) {
    next = next.is("claim_followup_sent_at", null);
  }

  const sanitized = sanitizeAdminBusinessSearch(q);
  if (sanitized) {
    const pattern = `%${sanitized}%`;
    next = next.or(
      `title.ilike."${pattern}",slug.ilike."${pattern}",email.ilike."${pattern}",phone.ilike."${pattern}"`
    );
  }

  return next;
};

export const getOutreachBusinesses = async (
  page,
  limit,
  {
    q = null,
    claimEligibility = null,
    websiteFilter = null,
    claimInviteSent = null,
    websiteOfferSent = null,
    claimFollowupSent = null,
  } = {}
) => {
  let query = supabase
    .from("outreach_business_list")
    .select(OUTREACH_LIST_SELECT, { count: "exact" })
    .order("total_score", { ascending: false })
    .order("reviews_count", { ascending: false });

  query = applyOutreachBusinessFilters(query, {
    q,
    claimEligibility,
    websiteFilter,
    claimInviteSent,
    websiteOfferSent,
    claimFollowupSent,
  });

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    return { data: null, count, error };
  }

  const businesses = await withOwnerEmails(data);
  return { data: businesses, count, error: null };
};

export const getOutreachMatchingBusinessIds = async ({
  outreachType,
  limit = 25,
  q = null,
  claimEligibility = null,
  websiteFilter = null,
  claimInviteSent = null,
  websiteOfferSent = null,
  claimFollowupSent = null,
} = {}) => {
  let query = supabase
    .from("outreach_business_list")
    .select(OUTREACH_LIST_SELECT)
    .order("total_score", { ascending: false })
    .order("reviews_count", { ascending: false });

  const filters = {
    q,
    claimEligibility,
    websiteFilter,
    claimInviteSent,
    websiteOfferSent,
    claimFollowupSent,
  };

  const isClaimInviteType =
    outreachType === "claim_invite" ||
    outreachType === "ownership_claim_invite" ||
    outreachType === "lead_claim_invite";

  if (isClaimInviteType) {
    filters.claimEligibility = claimEligibility || "able";
    if (claimInviteSent == null) filters.claimInviteSent = false;
  } else if (outreachType === "claim_followup") {
    filters.claimEligibility = claimEligibility || "able";
    if (claimInviteSent == null) filters.claimInviteSent = true;
    if (claimFollowupSent == null) filters.claimFollowupSent = false;
  } else if (outreachType === "website_offer") {
    if (websiteFilter == null) filters.websiteFilter = "none";
    if (websiteOfferSent == null) filters.websiteOfferSent = false;
    if (!claimEligibility) {
      filters.claimEligibility = ["able", "claimed"];
    }
  }

  query = applyOutreachBusinessFilters(query, filters);

  const fetchLimit = Math.min(Math.max(limit * 3, limit), 150);
  const { data, error } = await query.range(0, fetchLimit - 1);

  if (error) {
    return { data: null, businesses: null, error };
  }

  const withOwners = await withOwnerEmails(data ?? []);
  const matched = [];

  for (const row of withOwners) {
    if (matched.length >= limit) break;

    if (isClaimInviteType) {
      if (row.claim_eligibility !== "able") continue;
      if (row.claim_invite_sent_at) continue;
      const email = typeof row.email === "string" ? row.email.trim() : "";
      if (!email) continue;
      matched.push(row);
      continue;
    }

    if (outreachType === "claim_followup") {
      if (row.claim_eligibility !== "able") continue;
      if (!row.claim_invite_sent_at) continue;
      if (row.claim_followup_sent_at) continue;
      const email = typeof row.email === "string" ? row.email.trim() : "";
      if (!email) continue;
      matched.push(row);
      continue;
    }

    if (outreachType === "website_offer") {
      if (
        row.claim_eligibility !== "able" &&
        row.claim_eligibility !== "claimed"
      ) {
        continue;
      }
      const website =
        typeof row.website === "string" ? row.website.trim() : "";
      if (website) continue;
      if (row.website_offer_sent_at) continue;
      const ownerEmail =
        typeof row.owner_email === "string" ? row.owner_email.trim() : "";
      const listingEmail =
        typeof row.email === "string" ? row.email.trim() : "";
      if (!(ownerEmail || listingEmail)) continue;
      matched.push(row);
    }
  }

  return {
    data: matched.map((row) => row.id),
    businesses: matched,
    error: null,
  };
};

export const getOutreachBusinessesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("outreach_business_list")
    .select(OUTREACH_LIST_SELECT)
    .in("id", ids);

  if (error) {
    return { data: null, error };
  }

  const byId = new Map((data ?? []).map((row) => [row.id, row]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  const businesses = await withOwnerEmails(ordered);
  return { data: businesses, error: null };
};

export const insertOutreachHistory = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("outreach_history")
    .insert(rows)
    .select(
      "outreach_history_id, business_id, message_type, outreach_type, recipient, subject, provider_message_id, sent_at"
    );

  return { data, error };
};

const OUTREACH_HISTORY_LIST_SELECT =
  "outreach_history_id, business_id, message_type, outreach_type, recipient, subject, provider, provider_message_id, sent_at, metadata, created_at, title, slug, email";

const mapOutreachHistoryListRow = (row) => {
  if (!row) return row;
  const {
    title,
    slug,
    email,
    business_id,
    ...rest
  } = row;
  return {
    ...rest,
    business_id,
    business: {
      id: business_id,
      title: title ?? null,
      slug: slug ?? null,
      email: email ?? null,
    },
  };
};

export const getOutreachHistory = async (
  page,
  limit,
  { outreachType = null, q = null } = {}
) => {
  let query = supabase
    .from("outreach_history_list")
    .select(OUTREACH_HISTORY_LIST_SELECT, { count: "exact" })
    .order("sent_at", { ascending: false });

  if (outreachType) {
    query = query.eq("outreach_type", outreachType);
  }

  const sanitized = sanitizeAdminBusinessSearch(q);
  if (sanitized) {
    const pattern = `%${sanitized}%`;
    query = query.or(
      `title.ilike."${pattern}",slug.ilike."${pattern}",recipient.ilike."${pattern}",subject.ilike."${pattern}"`
    );
  }

  const { data, count, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1
  );

  if (error) {
    return { data: null, count, error };
  }

  return {
    data: (data ?? []).map(mapOutreachHistoryListRow),
    count,
    error: null,
  };
};

const AFFILIATE_PRODUCT_SELECT =
  "id, provider, product_link, affiliate_link, title, description, image_url, is_active, created_at";

const PUBLIC_AFFILIATE_PRODUCT_SELECT =
  "id, provider, product_link, affiliate_link, title, description, image_url";

export const getActiveAffiliateProductsByIds = async (ids) => {
  if (!ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("affiliate_products")
    .select(PUBLIC_AFFILIATE_PRODUCT_SELECT)
    .in("id", ids)
    .eq("is_active", true);

  return { data, error };
};

export const getActiveAffiliateProducts = async () => {
  const { data, error } = await supabase
    .from("affiliate_products")
    .select(PUBLIC_AFFILIATE_PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getAffiliateProducts = async (page, limit) => {
  const { data, count, error } = await supabase
    .from("affiliate_products")
    .select(AFFILIATE_PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return { data, count, error };
};

export const createAffiliateProduct = async (payload) => {
  const { data, error } = await supabase
    .from("affiliate_products")
    .insert({
      provider: payload.provider,
      product_link: payload.product_link,
      affiliate_link: payload.affiliate_link,
      title: payload.title,
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
      is_active: true,
    })
    .select(AFFILIATE_PRODUCT_SELECT)
    .single();

  return { data, error };
};

export const updateAffiliateProduct = async (id, payload) => {
  const { data, error } = await supabase
    .from("affiliate_products")
    .update({
      provider: payload.provider,
      product_link: payload.product_link,
      affiliate_link: payload.affiliate_link,
      title: payload.title,
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
    })
    .eq("id", id)
    .select(AFFILIATE_PRODUCT_SELECT)
    .single();

  return { data, error };
};

export const updateAffiliateProductsActive = async (ids, isActive) => {
  if (!ids?.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("affiliate_products")
    .update({ is_active: isActive })
    .in("id", ids)
    .select("id");

  return { data, error };
};
