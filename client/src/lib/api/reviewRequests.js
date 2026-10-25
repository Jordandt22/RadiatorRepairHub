import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export function fetchReviewRequests(businessId, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/review-requests?${params}`
  );
}

export function saveReviewMessageTemplate(businessId, messageTemplate) {
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/review-message`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageTemplate }),
    }
  );
}

export function fetchWebsiteLeads(
  businessId,
  { page = 1, q = "", sort = "newest", status = "all", service = "all" } = {}
) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (status && status !== "all") params.set("status", status);
  if (service && service !== "all") params.set("service", service);
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/website-leads?${params}`
  );
}

export function sendReviewRequest(businessId, body) {
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/review-requests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}
