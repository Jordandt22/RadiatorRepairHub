import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function createFeaturedCheckoutSession(businessId) {
  return fetchAuthenticatedApi("/billing/checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
}

export async function createBillingPortalSession() {
  return fetchAuthenticatedApi("/billing/portal-session", {
    method: "POST",
  });
}

export async function fetchBillingSubscriptions() {
  return fetchAuthenticatedApi("/billing/subscriptions");
}
