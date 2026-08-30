import { fetchApi } from "./fetchApi";

export async function fetchAdminSearchStatsList(query = {}, accessToken) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("limit", String(query.limit || 20));
  params.set("days", String(query.days ?? 7));
  params.set("dimension", query.dimension || "state");
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  if (query.dimensionId) params.set("dimension_id", query.dimensionId);
  if (query.stateId) params.set("state_id", query.stateId);
  return fetchApi(`/admin/search-stats?${params.toString()}`, {
    accessToken,
  });
}

export async function fetchAdminSearchStatsSummary(query = {}, accessToken) {
  const params = new URLSearchParams({
    days: String(query.days ?? 7),
    dimension: query.dimension || "state",
  });
  if (query.dimensionId) params.set("dimension_id", query.dimensionId);
  if (query.stateId) params.set("state_id", query.stateId);
  return fetchApi(`/admin/search-stats/summary?${params.toString()}`, {
    accessToken,
  });
}
