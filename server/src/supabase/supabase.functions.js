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
