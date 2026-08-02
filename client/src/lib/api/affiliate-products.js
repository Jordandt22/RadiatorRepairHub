import { fetchApi } from "./fetchApi";

/** Revalidate often so is_active changes show without a redeploy. */
const AFFILIATE_REVALIDATE_SECONDS = 60;

export async function fetchActiveAffiliateProductsByIds(ids = []) {
  if (!ids.length) {
    return { data: { products: [] }, error: null, status: 200 };
  }

  const params = new URLSearchParams({ ids: ids.join(",") });
  return fetchApi(`/affiliate-products?${params.toString()}`, {
    revalidate: AFFILIATE_REVALIDATE_SECONDS,
  });
}
