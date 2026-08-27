/** Search sort: 6 Featured (default, paid + verified boost), 5 Verified, 1–4 quality sorts. */
export const DEFAULT_SORT_OPTION = 6;

export const SORT_OPTION_BY_KEY = {
  featured: 6,
  verified: 5,
  most_reviews: 1,
  least_reviews: 2,
  highest_rating: 3,
  lowest_rating: 4,
};

export const SORT_KEY_BY_OPTION = {
  1: "most_reviews",
  2: "least_reviews",
  3: "highest_rating",
  4: "lowest_rating",
  5: "verified",
  6: "featured",
};

export const SORT_MENU_OPTIONS = [
  { value: 6, label: "Featured" },
  { value: 5, label: "Verified" },
  { value: 1, label: "Most Reviews" },
  { value: 2, label: "Least Reviews" },
  { value: 3, label: "Highest Rating" },
  { value: 4, label: "Lowest Rating" },
];

export function getSortKey(sortNum) {
  return SORT_KEY_BY_OPTION[Number(sortNum)] || SORT_KEY_BY_OPTION[DEFAULT_SORT_OPTION];
}

export function getSortOptionFromKey(sortKey) {
  if (typeof sortKey !== "string") return DEFAULT_SORT_OPTION;
  return SORT_OPTION_BY_KEY[sortKey.toLowerCase()] || DEFAULT_SORT_OPTION;
}
