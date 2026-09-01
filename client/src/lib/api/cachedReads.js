import { cache } from "react";
import {
  fetchBusinessBySlug as fetchBusinessBySlugRequest,
  fetchBusinessesSearch,
} from "@/lib/api/businesses";
import { DEFAULT_SORT_OPTION } from "@/lib/businesses/sortOptions";
import { SHORT_CACHE } from "@/lib/cachePolicy";
import { fetchPrimaryCategoryBySlug as fetchPrimaryCategoryBySlugRequest } from "@/lib/api/categories";
import {
  fetchAllCities as fetchAllCitiesRequest,
  fetchCityBySlug as fetchCityBySlugRequest,
  fetchCityBusinessCounts as fetchCityBusinessCountsRequest,
  fetchStateBusinessCounts as fetchStateBusinessCountsRequest,
} from "@/lib/api/location";
import { fetchPrimaryCategoryBusinessCounts as fetchPrimaryCategoryBusinessCountsRequest } from "@/lib/api/categories";
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

/**
 * Deduped per request so generateMetadata and the page body can both use the
 * counts without issuing the request twice.
 */
export const fetchCityBusinessCounts = cache((stateId) =>
  fetchCityBusinessCountsRequest(stateId)
);

export const fetchStateBusinessCountsByCodes = cache((codesKey) =>
  fetchStateBusinessCountsRequest({ codes: codesKey.split(",") })
);

export const fetchPrimaryCategoryBusinessCounts = cache(() =>
  fetchPrimaryCategoryBusinessCountsRequest()
);

/** Total listings for one state, derived from the per-city counts. */
export const fetchStateListingCount = cache(async (stateId) => {
  const { data } = await fetchCityBusinessCounts(stateId);
  return (data?.cities ?? []).reduce(
    (sum, city) => sum + (Number(city.business_count) || 0),
    0
  );
});

/**
 * Other listings in a city, used for the alternatives block on unclaimed
 * business pages. Fetches one extra row so the current listing can be removed
 * without leaving a short list.
 */
export const fetchBusinessesInCity = cache(
  async (cityId, limit = 4, excludeBusinessId = null) => {
    if (!cityId) return [];

    const { data, error } = await fetchBusinessesSearch(
      { city_id: cityId, sort_option: DEFAULT_SORT_OPTION },
      1,
      limit + 1,
      SHORT_CACHE
    );

    if (error) return [];

    return (data?.businesses ?? [])
      .filter((business) => business?.slug && business.id !== excludeBusinessId)
      .slice(0, limit);
  }
);
