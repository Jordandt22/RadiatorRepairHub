export const FEATURED_PAGE_SIZE = 12;
export const FEATURED_DEFAULT_SORT = "featured";

export const FEATURED_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "alpha", label: "Alphabetical" },
  { value: "most_reviews", label: "Most Reviews" },
  { value: "least_reviews", label: "Least Reviews" },
  { value: "highest_rating", label: "Highest Rating" },
  { value: "lowest_rating", label: "Lowest Rating" },
];

export function parseFeaturedSearchParams(searchParams = {}) {
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const rawSort = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;
  const rawQuery = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;

  const page = Math.max(1, Number.parseInt(rawPage, 10) || 1);
  const sort =
    typeof rawSort === "string" && rawSort.trim()
      ? rawSort.trim()
      : FEATURED_DEFAULT_SORT;
  const q = typeof rawQuery === "string" ? rawQuery.trim() : "";

  return { page, sort, q };
}

export function buildFeaturedHref({
  page = 1,
  sort = FEATURED_DEFAULT_SORT,
  q = "",
} = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort && sort !== FEATURED_DEFAULT_SORT) params.set("sort", sort);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/featured?${query}` : "/featured";
}
