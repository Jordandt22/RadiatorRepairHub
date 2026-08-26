import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinessStats(businessId, days = 7) {
  const params = new URLSearchParams({ days: String(days) });
  return fetchAuthenticatedApi(
    `/businesses/owned/${businessId}/stats?${params.toString()}`
  );
}
