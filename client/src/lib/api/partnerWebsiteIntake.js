import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchPartnerWebsiteIntake(businessId) {
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/website-intake`
  );
}

export async function submitPartnerWebsiteIntake(businessId, payload) {
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/website-intake`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}
