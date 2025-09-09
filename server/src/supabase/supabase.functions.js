import { supabase } from "./supabase.js";

// ---- Database ----

// Businesses
export const getTopRatedBusinesses = async () => {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .gte("reviews_count", 400)
    .order("total_score", { ascending: false })
    .limit(10);

  return { data, error };
};

export const getBusinessById = async (business_id) => {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `*, state:states(id, name, code), city:cities(id, name), postal_code:postal_codes(id, code), primary_category:primary_categories(id, name), secondary_categories:business_secondary_categories!inner(secondary_categories(id, name)), features:business_features(*), opening_hours_data:business_hours(*))`
    )
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

  if (data?.opening_hours_data) {
    delete data.opening_hours;
    data.opening_hours_data = data.opening_hours_data.map((item) => {
      delete item.id;
      delete item.business_id;
      return item;
    });
  }

  return { data, error };
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
