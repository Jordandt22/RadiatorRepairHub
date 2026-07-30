import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function updateBusinessCategories({
  businessId,
  primaryCategoryId,
  secondaryCategoryIds,
}) {
  return fetchAuthenticatedApi("/businesses/categories", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId,
      primaryCategoryId,
      secondaryCategoryIds,
    }),
  });
}
