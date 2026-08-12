import { supabase } from "../supabase/supabase.js";

const CITY_SELECT =
  "id, job_id, sort_index, city, state_id, location_query, status, apify_run_id, ingest_group_id, place_count, error_message, created_at, started_at, completed_at, failed_at";

function summarizeCityStatuses(cities = []) {
  return {
    total_cities: cities.length,
    completed_cities: cities.filter((c) => c.status === "completed").length,
    failed_cities: cities.filter((c) => c.status === "failed").length,
    running_cities: cities.filter((c) => c.status === "running").length,
    pending_cities: cities.filter((c) => c.status === "pending").length,
  };
}

export async function getStatesByIds(stateIds) {
  if (!stateIds.length) return [];

  const { data, error } = await supabase
    .from("states")
    .select("id, name, code")
    .in("id", stateIds);

  if (error) throw error;
  return data ?? [];
}

export async function createApifyScrapeJob({
  searchKeyword,
  maxPlaces,
  cityCount,
}) {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .insert({
      status: "pending",
      search_keyword: searchKeyword,
      max_places: maxPlaces,
      city_count: cityCount,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createApifyScrapeCities(rows) {
  if (!rows.length) return [];

  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .insert(rows)
    .select(CITY_SELECT);

  if (error) throw error;
  return data ?? [];
}

export async function getApifyScrapeJob(jobId) {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listApifyScrapeCities(jobId) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .select(`${CITY_SELECT}, state:states(id, name, code)`)
    .eq("job_id", jobId)
    .order("sort_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getApifyScrapeJobDetail(jobId) {
  const job = await getApifyScrapeJob(jobId);
  if (!job) return null;

  const cities = await listApifyScrapeCities(jobId);

  return {
    job: { ...job, ...summarizeCityStatuses(cities) },
    cities,
  };
}

export async function listApifyScrapeJobs() {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .select(
      "id, status, search_keyword, max_places, city_count, completed_count, failed_count, created_at, started_at, completed_at, failed_at, apify_scrape_cities(id, status)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((job) => {
    const { apify_scrape_cities: cities, ...rest } = job;
    return { ...rest, ...summarizeCityStatuses(cities ?? []) };
  });
}

export async function hasActiveApifyScrapeJob() {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .select("id")
    .in("status", ["pending", "running"])
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markApifyScrapeJobRunning(jobId) {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getApifyScrapeCity(cityId) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .select(CITY_SELECT)
    .eq("id", cityId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Retries re-claim their own `running` row so an in-flight Apify run can be resumed. */
export async function claimApifyScrapeCity(cityId) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", cityId)
    .in("status", ["pending", "running"])
    .select(CITY_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setApifyScrapeCityRunId(cityId, apifyRunId) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .update({ apify_run_id: apifyRunId })
    .eq("id", cityId)
    .select("id, apify_run_id")
    .single();

  if (error) throw error;
  return data;
}

export async function completeApifyScrapeCity(cityId, { ingestGroupId, placeCount }) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .update({
      status: "completed",
      ingest_group_id: ingestGroupId,
      place_count: placeCount,
      completed_at: new Date().toISOString(),
      failed_at: null,
      error_message: null,
    })
    .eq("id", cityId)
    .select(CITY_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function failApifyScrapeCity(cityId, errorMessage) {
  const { data, error } = await supabase
    .from("apify_scrape_cities")
    .update({
      status: "failed",
      error_message: errorMessage,
      failed_at: new Date().toISOString(),
      completed_at: null,
    })
    .eq("id", cityId)
    .select(CITY_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function refreshApifyScrapeJobProgress(jobId) {
  const cities = await listApifyScrapeCities(jobId);
  const stats = summarizeCityStatuses(cities);
  const allTerminal =
    cities.length > 0 &&
    cities.every((city) => ["completed", "failed"].includes(city.status));

  const patch = {
    completed_count: stats.completed_cities,
    failed_count: stats.failed_cities,
  };

  if (allTerminal) {
    const allFailed = stats.completed_cities === 0;
    patch.status = allFailed ? "failed" : "completed";
    patch.completed_at = new Date().toISOString();
    if (allFailed) {
      patch.failed_at = new Date().toISOString();
      patch.failed_data = {
        code: "apify_scrape_all_cities_failed",
        message: "Every city in this scrape failed.",
      };
    }
  } else {
    patch.status = "running";
  }

  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .update(patch)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApifyScrapeJobs(jobIds) {
  const { data, error } = await supabase
    .from("apify_scrape_jobs")
    .delete()
    .in("id", jobIds)
    .in("status", ["completed", "failed"])
    .select("id");

  if (error) throw error;
  return data ?? [];
}
