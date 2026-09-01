import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinessStats(businessId, days = 7) {
  const params = new URLSearchParams({ days: String(days) });
  return fetchAuthenticatedApi(
    `/businesses/owned/${businessId}/stats?${params.toString()}`
  );
}

export async function fetchOwnedCompetitorInsights(businessId, days = 7) {
  const params = new URLSearchParams({ days: String(days) });
  return fetchAuthenticatedApi(
    `/businesses/owned/${businessId}/competitor-insights?${params.toString()}`
  );
}
