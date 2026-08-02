/**
 * Shared default search body for directory listings (SSR + client SWR).
 * Keep in sync with FilterProvider defaults / ContentWrapper applied filters.
 */
export const LISTINGS_PAGE_LIMIT = 12;

export function buildListingsSearchBody({
  stateData = null,
  cityData = null,
  searchParams = {},
} = {}) {
  const sortOptions = {
    most_reviews: 1,
    least_reviews: 2,
    highest_rating: 3,
    lowest_rating: 4,
  };

  const sortKey =
    typeof searchParams?.sort === "string"
      ? searchParams.sort.toLowerCase()
      : "";
  const sort_option = sortOptions[sortKey] || 1;

  let title = "";
  if (typeof searchParams?.title === "string") {
    title = searchParams.title.trim().slice(0, 150);
    if (/[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/gi.test(title)) {
      title = "";
    }
  }

  return {
    title,
    state_id: stateData?.id ?? "",
    city_id: cityData?.id ?? "",
    postal_code_id: "",
    total_score: 3,
    reviews_count: 1,
    primary_category_id:
      typeof searchParams?.primary_category_id === "string"
        ? searchParams.primary_category_id.trim()
        : "",
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
  const parsed = Number(searchParams?.page);
  return !Number.isNaN(parsed) && parsed >= 1 ? parsed : 1;
}
