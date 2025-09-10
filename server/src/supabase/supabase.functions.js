import { supabase } from "./supabase.js";

const listingBusinessSelect = `*, state:states(id, name, code), city:cities(id, name), postal_code:postal_codes(id, code), primary_category:primary_categories(id, name), features:business_features(*)`;
const fullBusinessSelect = `*, state:states(id, name, code), city:cities(id, name), postal_code:postal_codes(id, code), primary_category:primary_categories(id, name), secondary_categories:business_secondary_categories!inner(secondary_categories(id, name)), features:business_features(*)`;

const formatBusinessListings = (data) => {
  data.map((business) => delete business.additional_info);

  data.map((business) => {
    business.features = { ...business.features[0] };
    delete business.features.id;
    delete business.features.business_id;
    return business;
  });

  return data;
};

// ---- Database ----

// Businesses
export const getTopRatedBusinesses = async () => {
  const { data, error } = await supabase
    .from("businesses")
    .select(listingBusinessSelect)
    .gte("reviews_count", 400)
    .order("total_score", { ascending: false })
    .limit(10);

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

  if (data?.secondary_categories) {
    data.secondary_categories = data.secondary_categories.map(
      (item) => item.secondary_categories
    );
  }

  if (data?.features) {
    data.features = { ...data.features[0] };
    delete data.features.id;
    delete data.features.business_id;
  }

  return { data, error };
};

export const countBusinessesByState = async (state_id) => {
  const { count, error } = await supabase
    .from("businesses")
    .select("*", { count: "exact" })
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
