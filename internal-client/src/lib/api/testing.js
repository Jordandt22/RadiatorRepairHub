import { fetchApi } from "@/lib/api/fetchApi";

function listParams({ page, limit, q }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set("q", q);
  return params.toString();
}

export function fetchTestBusinesses({ accessToken, page, limit, q }) {
  return fetchApi(`/admin/testing/businesses?${listParams({ page, limit, q })}`, {
    accessToken,
  });
}

export function fetchTestBusinessDefaults({ accessToken }) {
  return fetchApi("/admin/testing/businesses/defaults", { accessToken });
}

export function createTestBusiness({ accessToken, body }) {
  return fetchApi("/admin/testing/businesses", {
    method: "POST",
    accessToken,
    body: JSON.stringify(body),
  });
}

export function deleteTestBusiness({ accessToken, id }) {
  return fetchApi(`/admin/testing/businesses/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export function fetchTestUsers({ accessToken, page, limit, q }) {
  return fetchApi(`/admin/testing/users?${listParams({ page, limit, q })}`, {
    accessToken,
  });
}

export function createTestUser({ accessToken, body }) {
  return fetchApi("/admin/testing/users", {
    method: "POST",
    accessToken,
    body: JSON.stringify(body),
  });
}

export function deleteTestUser({ accessToken, uid }) {
  return fetchApi(`/admin/testing/users/${uid}`, {
    method: "DELETE",
    accessToken,
  });
}
