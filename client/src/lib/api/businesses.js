import { fetchApi } from "./fetchApi";
import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";
import { DEFAULT_SORT_OPTION } from "@/lib/businesses/sortOptions";
import { isUsableBusinessSlug } from "@/lib/businesses/slug";
import { NO_STORE, SITEMAP_CACHE } from "@/lib/cachePolicy";

export async function fetchBusinessSlugsForSitemap(options = SITEMAP_CACHE) {
  return fetchApi("/businesses/sitemap-slugs", options);
}

export async function fetchBusinessBySlug(slug, options = NO_STORE) {
  if (!isUsableBusinessSlug(slug)) {
    return {
      data: null,
      error: { message: "Business not found" },
      status: 404,
    };
  }

  return fetchApi(`/businesses/${slug}`, {
    ...options,
    next: {
      tags: [`business:${slug}`, "business-listings"],
      ...(options.next || {}),
    },
  });
}

export async function fetchTopVerifiedBusinesses(options = NO_STORE) {
  return fetchApi("/businesses/top-verified", {
    ...options,
    next: {
      tags: ["top-verified"],
      ...(options.next || {}),
    },
  });
}

export async function fetchBusinessesSearch(
  body,
  page = 1,
  limit = 12,
  options = NO_STORE
) {
  return fetchApi(`/businesses/search?page=${page}&limit=${limit}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...options,
  });
}

export async function fetchBusinessesByCategory(
  primaryCategoryId,
  page = 1,
  limit = 12,
  options = NO_STORE
) {
  return fetchBusinessesSearch(
    {
      primary_category_id: primaryCategoryId,
      sort_option: DEFAULT_SORT_OPTION,
    },
    page,
    limit,
    options
  );
}

export async function claimBusiness(
  businessId,
  { channel = "email", consentAcknowledged = false } = {}
) {
  return fetchApi("/businesses/claim/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, channel, consentAcknowledged }),
    cache: "no-store",
  });
}

export async function fetchClaimRequest(claimRequestId, options = NO_STORE) {
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

export async function resendClaimCode(claimRequestId, consentAcknowledged = true) {
  return fetchApi("/businesses/claim/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claimRequestId, consentAcknowledged }),
    cache: "no-store",
  });
}

export async function completeClaimRequest(payload, { authenticated = false } = {}) {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  };

  if (authenticated) {
    return fetchAuthenticatedApi("/businesses/claim", options);
  }

  return fetchApi("/businesses/claim", options);
}
