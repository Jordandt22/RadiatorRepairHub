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
    business.features = { ...business.features[0] };
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
  let businessesQuery = supabase.from("businesses").select(fullBusinessSelect, {
    count: "exact",
  });

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

  // Format Data
  if (data) {
    const formattedData = data.map((business) => formatFullBusiness(business));

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

export const getAllPostalCodes = async (city_id) => {
  const { data, error } = await supabase
    .from("postal_codes")
    .select("*")
    .order("code", { ascending: true })
    .eq("city_id", city_id);

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
