import STATES from "@/lib/data/states";

const stateCodeById = Object.fromEntries(
  STATES.map((state) => [state.id, state.code])
);

function toIsoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function buildSitemapEntries({
  cities = [],
  primaryCategories = [],
  businesses = [],
  blogPosts = [],
  statesWithBusinesses = new Set(),
}) {
  const staticPages = [
    { url: "", changeFrequency: "weekly", priority: 1.0 },
    { url: "/categories", changeFrequency: "weekly", priority: 0.9 },
    { url: "/states", changeFrequency: "weekly", priority: 0.9 },
    { url: "/about", changeFrequency: "monthly", priority: 0.7 },
    { url: "/blogs", changeFrequency: "weekly", priority: 0.8 },
    { url: "/shop", changeFrequency: "weekly", priority: 0.6 },
    { url: "/how-to-claim", changeFrequency: "monthly", priority: 0.7 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { url: "/get-listed", changeFrequency: "monthly", priority: 0.8 },
    { url: "/featured", changeFrequency: "weekly", priority: 0.6 },
    { url: "/pricing", changeFrequency: "monthly", priority: 0.75 },
    { url: "/faq", changeFrequency: "monthly", priority: 0.7 },
    { url: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const majorStates = new Set(["CA", "TX", "NY", "FL", "WA", "IA"]);

  const categoryPages = primaryCategories
    .filter(
      (category) => category?.slug && Number(category.business_count) > 0
    )
    .map((category) => ({
      url: `/category/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const statePages = STATES.filter((state) =>
    statesWithBusinesses.has(state.code)
  ).map((state) => ({
    url: `/state/${state.code}`,
    changeFrequency: majorStates.has(state.code) ? "daily" : "weekly",
    priority: majorStates.has(state.code) ? 0.9 : 0.7,
  }));

  const stateCityIndexPages = STATES.filter((state) =>
    statesWithBusinesses.has(state.code)
  ).map((state) => ({
    url: `/states/${state.code}/cities`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cityPages = cities
    .map((city) => {
      const stateCode = stateCodeById[city.state_id];
      if (!stateCode || !city.slug || Number(city.business_count) <= 0) {
        return null;
      }

      return {
        url: `/state/${stateCode}/city/${city.slug}`,
        lastModified: toIsoDate(city.last_modified),
        changeFrequency: "weekly",
        priority: majorStates.has(stateCode) ? 0.8 : 0.6,
      };
    })
    .filter(Boolean);

  const businessPages = businesses
    .filter((business) => business.slug)
    .map((business) => ({
      url: `/business/${business.slug}`,
      lastModified: toIsoDate(business.scraped_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const blogPostPages = blogPosts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `/blogs/${post.slug}`,
      lastModified: toIsoDate(post.metadata?.date),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...statePages,
    ...stateCityIndexPages,
    ...cityPages,
    ...businessPages,
    ...blogPostPages,
  ];
}
