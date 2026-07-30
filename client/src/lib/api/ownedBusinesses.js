import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinesses() {
  return fetchAuthenticatedApi("/businesses/owned");
}
