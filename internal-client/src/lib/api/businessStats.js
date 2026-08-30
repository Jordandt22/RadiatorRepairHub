import { fetchApi } from "./fetchApi";

export async function fetchAdminBusinessStats(businessId, days = 7, accessToken) {
  const params = new URLSearchParams({ days: String(days) });
  return fetchApi(
    `/admin/businesses/${businessId}/stats?${params.toString()}`,
    { accessToken }
  );
}

export async function fetchAdminBusinessStatsList(query = {}, accessToken) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("limit", String(query.limit || 20));
  params.set("days", String(query.days ?? 7));
  if (query.q) params.set("q", query.q);
  if (query.claimed === true) params.set("claimed", "true");
  if (query.featured === true) params.set("featured", "true");
  if (query.activity && query.activity !== "all") {
    params.set("activity", query.activity);
  }
  if (query.sort) params.set("sort", query.sort);
  if (query.stateId) params.set("state_id", query.stateId);
  if (query.cityId) params.set("city_id", query.cityId);
  return fetchApi(`/admin/businesses/stats?${params.toString()}`, {
    accessToken,
  });
}

export async function fetchAdminBusinessStatsSummary(query = {}, accessToken) {
  const params = new URLSearchParams({ days: String(query.days ?? 7) });
  if (query.claimed === true) params.set("claimed", "true");
  if (query.featured === true) params.set("featured", "true");
  if (query.stateId) params.set("state_id", query.stateId);
  if (query.cityId) params.set("city_id", query.cityId);
  return fetchApi(`/admin/businesses/stats/summary?${params.toString()}`, {
    accessToken,
  });
}
