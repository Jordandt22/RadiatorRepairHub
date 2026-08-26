export const LISTING_SOURCES = {
  SEARCH: "search",
  FEATURED: "featured",
  TOP_VERIFIED: "top_verified",
  STATE: "state",
  CITY: "city",
  CATEGORY: "category",
};

export function getListingSurface({
  stateData = null,
  cityData = null,
  categoryData = null,
} = {}) {
  if (categoryData) return LISTING_SOURCES.CATEGORY;
  if (cityData) return LISTING_SOURCES.CITY;
  if (stateData) return LISTING_SOURCES.STATE;
  return LISTING_SOURCES.SEARCH;
}

export function getAbsolutePosition(page, pageSize, index) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || 1);
  const safeIndex = Math.max(0, Number(index) || 0);
  return (safePage - 1) * safeSize + safeIndex + 1;
}
