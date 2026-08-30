import { fetchApi } from "@/lib/api/fetchApi";

function asId(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export async function trackSearchStat({
  stateId,
  cityId,
  categoryId,
  zeroResults,
} = {}) {
  const state_id = asId(stateId);
  const city_id = asId(cityId);
  const category_id = asId(categoryId);
  if (!state_id && !city_id && !category_id) return;

  try {
    await fetchApi("/search-stats/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state_id,
        city_id,
        category_id,
        zero_results: Boolean(zeroResults),
      }),
      cache: "no-store",
    });
  } catch {
    // best-effort
  }
}
