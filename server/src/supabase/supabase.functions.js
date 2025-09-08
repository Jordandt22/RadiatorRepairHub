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