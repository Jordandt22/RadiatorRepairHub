import { fetchApi } from "@/lib/api/fetchApi";

export async function submitListingReport(payload) {
  return fetchApi("/listing-reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
