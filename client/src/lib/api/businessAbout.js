import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function updateBusinessAbout({ businessId, description }) {
  return fetchAuthenticatedApi("/businesses/about", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId,
      description,
    }),
  });
}
