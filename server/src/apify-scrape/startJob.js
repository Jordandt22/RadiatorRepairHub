import {
  createApifyScrapeCities,
  createApifyScrapeJob,
  getStatesByIds,
} from "./db.js";
import { buildLocationQuery } from "./locationQuery.js";
import { enqueueApifyScrapeCityJobs } from "./queues.js";

export class ApifyScrapeError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApifyScrapeError";
    this.code = code;
  }
}

export async function startApifyScrapeJob({
  searchKeyword,
  maxPlaces,
  cities,
}) {
  const stateIds = [...new Set(cities.map((city) => city.stateId))];
  const states = await getStatesByIds(stateIds);
  const stateById = new Map(states.map((state) => [state.id, state]));

  const missing = stateIds.filter((id) => !stateById.has(id));
  if (missing.length > 0) {
    throw new ApifyScrapeError(
      "invalid_state",
      "One or more selected states do not exist."
    );
  }

  const job = await createApifyScrapeJob({
    searchKeyword,
    maxPlaces,
    cityCount: cities.length,
  });

  const cityRows = cities.map((city, index) => ({
    job_id: job.id,
    sort_index: index,
    city: city.city,
    state_id: city.stateId,
    location_query: buildLocationQuery(city.city, stateById.get(city.stateId)),
    status: "pending",
  }));

  const createdCities = await createApifyScrapeCities(cityRows);
  await enqueueApifyScrapeCityJobs(createdCities);

  return { job, cities: createdCities };
}
