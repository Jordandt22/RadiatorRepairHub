import { fetchApi } from "./fetchApi";

export async function fetchAdminBusinessStats(businessId, days = 7, accessToken) {
  const params = new URLSearchParams({ days: String(days) });
  return fetchApi(
    `/admin/businesses/${businessId}/stats?${params.toString()}`,
    { accessToken }
  );
}
