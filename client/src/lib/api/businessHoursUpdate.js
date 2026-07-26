import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function updateBusinessHours({ businessId, days }) {
  return fetchAuthenticatedApi("/businesses/hours", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId,
      days,
    }),
  });
}
