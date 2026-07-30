import { fetchApi } from "./fetchApi";

const REFERENCE_CACHE = { cache: "no-store" };

export async function fetchBusinessSlugsForSitemap(options = REFERENCE_CACHE) {
  return fetchApi("/businesses/sitemap-slugs", options);
}

export async function fetchBusinessBySlug(slug, options = REFERENCE_CACHE) {
  return fetchApi(`/businesses/${slug}`, options);
}

export async function fetchFeaturedBusinesses(options = REFERENCE_CACHE) {
  return fetchApi("/businesses/featured", options);
}

export async function fetchBusinessesByCategory(
  primaryCategoryId,
  page = 1,
  limit = 12,
  options = REFERENCE_CACHE
) {
  return fetchApi(`/businesses/search?page=${page}&limit=${limit}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      primary_category_id: primaryCategoryId,
      sort_option: 1,
    }),
    ...options,
  });
}

export async function claimBusiness(businessId) {
  return fetchApi("/businesses/claim/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
    cache: "no-store",
  });
}

export async function fetchClaimRequest(claimRequestId, options = REFERENCE_CACHE) {
  return fetchApi(`/businesses/claim/${claimRequestId}`, options);
}

export async function cancelClaimRequest(claimRequestId) {
  return fetchApi("/businesses/claim/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimRequestId }),
    cache: "no-store",
  });
}

export async function resendClaimCode(claimRequestId) {
  return fetchApi("/businesses/claim/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimRequestId }),
    cache: "no-store",
  });
}

export async function completeClaimRequest(payload) {
  return fetchApi("/businesses/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
