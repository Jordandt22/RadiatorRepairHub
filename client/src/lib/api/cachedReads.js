import { cache } from "react";
import { fetchBusinessBySlug as fetchBusinessBySlugRequest } from "@/lib/api/businesses";
import { fetchPrimaryCategoryBySlug as fetchPrimaryCategoryBySlugRequest } from "@/lib/api/categories";
import {
  fetchAllCities as fetchAllCitiesRequest,
  fetchCityBySlug as fetchCityBySlugRequest,
  fetchStateBusinessCounts as fetchStateBusinessCountsRequest,
} from "@/lib/api/location";
import STATES from "@/lib/data/states";

export const DIRECTORY_STATE_COUNTS_LIMIT = 6;
export const FOOTER_STATE_COUNTS_LIMIT = 5;

export const fetchDirectoryTotals = cache(async () => {
  const [statesRes, citiesRes] = await Promise.all([
    fetchStateBusinessCountsRequest({
      codes: STATES.map((state) => state.code),
    }),
    fetchAllCitiesRequest(),
  ]);

  const totalBusinesses = (statesRes.data?.states ?? []).reduce(
    (sum, state) => sum + Number(state.business_count || 0),
    0,
  );
  const totalCities = Array.isArray(citiesRes.data) ? citiesRes.data.length : 0;

  return { totalBusinesses, totalCities };
});

export const fetchBusinessBySlug = cache((slug, options) =>
  fetchBusinessBySlugRequest(slug, options)
);

export const fetchCityBySlug = cache((stateId, citySlug) =>
  fetchCityBySlugRequest(stateId, citySlug)
);

export const fetchPrimaryCategoryBySlug = cache((slug) =>
  fetchPrimaryCategoryBySlugRequest(slug)
);

export const fetchStateBusinessCountsByLimit = cache((limit) =>
  fetchStateBusinessCountsRequest({ limit })
);
