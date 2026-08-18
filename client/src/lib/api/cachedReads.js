import { cache } from "react";
import { fetchBusinessBySlug as fetchBusinessBySlugRequest } from "@/lib/api/businesses";
import { fetchPrimaryCategoryBySlug as fetchPrimaryCategoryBySlugRequest } from "@/lib/api/categories";
import {
  fetchCityBySlug as fetchCityBySlugRequest,
  fetchStateBusinessCounts as fetchStateBusinessCountsRequest,
} from "@/lib/api/location";

export const DIRECTORY_STATE_COUNTS_LIMIT = 6;
export const FOOTER_STATE_COUNTS_LIMIT = 5;

export const fetchBusinessBySlug = cache((slug) =>
  fetchBusinessBySlugRequest(slug)
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
