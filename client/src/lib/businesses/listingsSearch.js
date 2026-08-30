/**
 * Shared default search body for directory listings (SSR + client SWR).
 * Keep in sync with FilterProvider defaults / ContentWrapper applied filters.
 */
import {
  DEFAULT_SORT_OPTION,
  getSortOptionFromKey,
} from "@/lib/businesses/sortOptions";

export const LISTINGS_PAGE_LIMIT = 12;

export const DEFAULT_LISTING_FILTERS = {
  title: "",
  state_id: "",
  city_id: "",
  postal_code_id: "",
  total_score: 3,
  reviews_count: 1,
  primary_category_id: "",
  secondary_categories: [],
  features: [],
  open: {
    weekdays: false,
    weekends: false,
  },
};

export function getSearchParamString(searchParams, key) {
  if (!searchParams) return "";
  const value =
    typeof searchParams.get === "function"
      ? searchParams.get(key)
      : searchParams[key];
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }
  return typeof value === "string" ? value.trim() : "";
}

export function searchParamsRecord(input) {
  if (!input) return {};
  if (typeof input.forEach === "function") {
    const obj = {};
    input.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  const obj = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null || value === "") continue;
    obj[key] = Array.isArray(value) ? value[0] : value;
  }
  return obj;
}

export function mergeListingSearchParams(urlParams, serverParams) {
  return {
    ...searchParamsRecord(serverParams),
    ...searchParamsRecord(urlParams),
  };
}

export function listingSearchCacheKey(body = {}) {
  return JSON.stringify({
    title: body.title || "",
    state_id: body.state_id || "",
    city_id: body.city_id || "",
    postal_code_id: body.postal_code_id || "",
    total_score: Number(body.total_score) || 0,
    reviews_count: Number(body.reviews_count) || 0,
    primary_category_id: body.primary_category_id || "",
    secondary_categories: body.secondary_categories || [],
    features: body.features || {},
    open: body.open || {},
    sort_option: body.sort_option || DEFAULT_SORT_OPTION,
  });
}

export function buildListingsSearchBody({
  stateData = null,
  cityData = null,
  categoryData = null,
  searchParams = {},
} = {}) {
  const sort_option = getSortOptionFromKey(searchParams?.sort);

  let title = getSearchParamString(searchParams, "title");
  if (title.length > 150) title = "";
  if (/[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/gi.test(title)) {
    title = "";
  }

  const totalScore = Number(getSearchParamString(searchParams, "total_score"));
  const reviewsCount = Number(
    getSearchParamString(searchParams, "reviews_count")
  );

  return {
    title,
    state_id: stateData?.id || getSearchParamString(searchParams, "state_id"),
    city_id: cityData?.id || getSearchParamString(searchParams, "city_id"),
    postal_code_id: getSearchParamString(searchParams, "postal_code_id"),
    total_score:
      Number.isFinite(totalScore) && totalScore >= 1 && totalScore <= 5
        ? totalScore
        : 3,
    reviews_count:
      Number.isFinite(reviewsCount) && reviewsCount >= 1 && reviewsCount <= 500
        ? reviewsCount
        : 1,
    primary_category_id: categoryData?.id
      ? categoryData.id
      : getSearchParamString(searchParams, "primary_category_id"),
    secondary_categories: [],
    features: {},
    open: {
      weekdays: false,
      weekends: false,
    },
    sort_option,
  };
}

export function getListingsPage(searchParams = {}) {
  const parsed = Number(getSearchParamString(searchParams, "page") || searchParams?.page);
  return !Number.isNaN(parsed) && parsed >= 1 ? parsed : 1;
}

export { DEFAULT_SORT_OPTION };
