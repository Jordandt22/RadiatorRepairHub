import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinessNotifications(businessId) {
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/notifications`
  );
}

export async function updateOwnedBusinessNotifications(
  businessId,
  { notificationEmail, weeklyDigestEnabled }
) {
  const body = {};
  if (notificationEmail !== undefined) {
    body.notificationEmail = notificationEmail;
  }
  if (weeklyDigestEnabled !== undefined) {
    body.weeklyDigestEnabled = weeklyDigestEnabled;
  }
  return fetchAuthenticatedApi(
    `/businesses/owned/${encodeURIComponent(businessId)}/notifications`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}
