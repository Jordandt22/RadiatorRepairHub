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
