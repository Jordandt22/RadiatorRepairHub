import { supabase } from "./supabase.js";

const listingBusinessSelect = `*, state:states(*), city:cities(*), postal_code:postal_codes(*), primary_category:primary_categories(*), features:business_features!inner(*)`;
const fullBusinessSelect = `*, state:states(*), city:cities!inner(*), postal_code:postal_codes(*), primary_category:primary_categories(*), secondary_categories:business_secondary_categories!inner(secondary_categories(*)), features:business_features!inner(*), hours:business_hours!inner(*)`;

const formatBusinessListings = (data) => {
  data.map((business) => delete business.additional_info);

  data.map((business) => {
    business.features = { ...business.features[0] };
    delete business.features.id;
    delete business.features.business_id;

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
  if (business?.secondary_categories) {
    business.secondary_categories = business.secondary_categories.map(
      (item) => ({
        ...item.secondary_categories,
      })
    );
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

  return business;
};
// ---- Database ----

// Businesses
export const getTopRatedBusinesses = async () => {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      listingBusinessSelect +
        ", secondary_categories:business_secondary_categories!inner(secondary_categories(*)) , hours:business_hours!inner(*)"
    )
    .gte("reviews_count", 400)
    .order("total_score", { ascending: false })
    .limit(12);

  if (data) {
    return { data: formatBusinessListings(data), error };
  }

  return { data: null, error };
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
  switch (sort_option) {
    // Most Reviews
    case 1:
      businessesQuery = businessesQuery.order("reviews_count", {
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

    // Default
    default:
      businessesQuery = businessesQuery.order("reviews_count", {
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
    .select("id, title, slug, email, is_claimed")
    .eq("id", business_id)
    .single();

  return { data, error };
};

export const getPendingClaimRequest = async (business_id) => {
  const { data, error } = await supabase
    .from("claim_requests")
    .select("claim_request_id")
    .eq("business_id", business_id)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

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
      "*, business:businesses(id, email, title, slug, address, city_id, postal_code_id)"
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
