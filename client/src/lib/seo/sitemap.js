import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";

const stateCodeById = Object.fromEntries(
  STATES.map((state) => [state.id, state.code])
);

export function buildSitemapEntries(currentDate) {
  const staticPages = [
    { url: "", changeFrequency: "weekly", priority: 1.0 },
    { url: "/categories", changeFrequency: "weekly", priority: 0.9 },
    { url: "/search", changeFrequency: "daily", priority: 0.9 },
    { url: "/states", changeFrequency: "weekly", priority: 0.9 },
    { url: "/about", changeFrequency: "monthly", priority: 0.7 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { url: "/get-listed", changeFrequency: "monthly", priority: 0.8 },
    { url: "/featured", changeFrequency: "daily", priority: 0.8 },
    { url: "/faq", changeFrequency: "monthly", priority: 0.7 },
    { url: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ].map((page) => ({ ...page, lastModified: currentDate }));

  const categoryPages = PRIMARY_CATEGORIES.map((category) => ({
    url: `/category/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const majorStates = new Set(["CA", "TX", "NY", "FL", "WA", "IA"]);

  const statePages = STATES.map((state) => ({
    url: `/state/${state.code}`,
    lastModified: currentDate,
    changeFrequency: majorStates.has(state.code) ? "daily" : "weekly",
    priority: majorStates.has(state.code) ? 0.9 : 0.7,
  }));

  const stateCityIndexPages = STATES.map((state) => ({
    url: `/states/${state.code}/cities`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const cityPages = CITIES.map((city) => {
    const stateCode = stateCodeById[city.state_id];
    if (!stateCode) return null;

    return {
      url: `/state/${stateCode}/city/${city.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: majorStates.has(stateCode) ? 0.8 : 0.6,
    };
  }).filter(Boolean);

  return [
    ...staticPages,
    ...categoryPages,
    ...statePages,
    ...stateCityIndexPages,
    ...cityPages,
  ];
}
