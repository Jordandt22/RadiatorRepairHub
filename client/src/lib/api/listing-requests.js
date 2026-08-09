import { fetchApi } from "@/lib/api/fetchApi";

export async function submitListingRequest(payload) {
  return fetchApi("/listing-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
