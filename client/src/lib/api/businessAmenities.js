import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function updateBusinessAmenities({ businessId, features }) {
  return fetchAuthenticatedApi("/businesses/amenities", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId,
      features,
    }),
  });
}
