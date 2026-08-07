import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinesses() {
  return fetchAuthenticatedApi("/businesses/owned");
}

export async function unclaimOwnedBusiness(businessId) {
  return fetchAuthenticatedApi("/businesses/unclaim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
}
