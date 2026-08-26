import { fetchApi } from "./fetchApi";
import { resolveAffiliateProductIds } from "@/lib/affiliateProducts";
import { SHORT_REVALIDATE_SECONDS } from "@/lib/cachePolicy";

export async function fetchActiveAffiliateProducts() {
  return fetchApi("/affiliate-products", {
    revalidate: SHORT_REVALIDATE_SECONDS,
  });
}

export async function fetchActiveAffiliateProductsByIds(ids = []) {
  if (!ids.length) {
    return { data: { products: [] }, error: null, status: 200 };
  }

  const params = new URLSearchParams({ ids: ids.join(",") });
  return fetchApi(`/affiliate-products?${params.toString()}`, {
    revalidate: SHORT_REVALIDATE_SECONDS,
  });
}

export async function fetchActiveAffiliateProductsByAliases(aliases = []) {
  const ids = resolveAffiliateProductIds(aliases);
  return fetchActiveAffiliateProductsByIds(ids);
}
