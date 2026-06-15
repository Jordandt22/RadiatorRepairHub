import { fetchApi } from "./fetchApi";

const REFERENCE_CACHE = { cache: "no-store" };

export async function fetchBusinessSlugsForSitemap(options = REFERENCE_CACHE) {
  return fetchApi("/businesses/sitemap-slugs", options);
}
