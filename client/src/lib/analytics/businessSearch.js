/**
 * Shared PostHog props for directory search / filter events.
 */
export function getBusinessSearchAnalyticsProps(filters = {}, extras = {}) {
  const secondary = filters.secondary_categories;
  const features = filters.features;
  const open = filters.open || {};

  let featuresCount = 0;
  if (Array.isArray(features)) {
    featuresCount = features.length;
  } else if (features && typeof features === "object") {
    featuresCount = Object.values(features).filter(Boolean).length;
  }

  return {
    title: typeof filters.title === "string" && filters.title.trim()
      ? filters.title.trim()
      : undefined,
    state_id: filters.state_id || undefined,
    city_id: filters.city_id || undefined,
    postal_code_id: filters.postal_code_id || undefined,
    primary_category_id: filters.primary_category_id || undefined,
    secondary_categories_count: Array.isArray(secondary) ? secondary.length : 0,
    features_count: featuresCount,
    total_score:
      typeof filters.total_score === "number" ? filters.total_score : undefined,
    reviews_count:
      typeof filters.reviews_count === "number"
        ? filters.reviews_count
        : undefined,
    open_weekdays: Boolean(open.weekdays),
    open_weekends: Boolean(open.weekends),
    sort_option:
      extras.sort_option ?? filters.sort_option ?? undefined,
    page: extras.page ?? undefined,
    has_state_context: Boolean(extras.stateData),
    has_city_context: Boolean(extras.cityData),
    source: extras.source || undefined,
  };
}
