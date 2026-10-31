import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

function intakePath(businessId, suffix = "") {
  return `/businesses/owned/${encodeURIComponent(businessId)}/website-intake${suffix}`;
}

export async function fetchPartnerWebsiteIntake(businessId) {
  return fetchAuthenticatedApi(intakePath(businessId));
}

export async function patchPartnerWebsiteIntake(businessId, payload) {
  return fetchAuthenticatedApi(intakePath(businessId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function submitPartnerWebsiteIntake(businessId, payload) {
  return fetchAuthenticatedApi(intakePath(businessId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function uploadPartnerWebsiteIntakeLogo(businessId, file) {
  const body = new FormData();
  body.append("image", file);
  return fetchAuthenticatedApi(intakePath(businessId, "/logo"), {
    method: "POST",
    body,
  });
}

export async function uploadPartnerWebsiteIntakeImage(businessId, file) {
  const body = new FormData();
  body.append("image", file);
  return fetchAuthenticatedApi(intakePath(businessId, "/images"), {
    method: "POST",
    body,
  });
}

export async function deletePartnerWebsiteIntakeImage(businessId, imageId) {
  return fetchAuthenticatedApi(
    intakePath(businessId, `/images/${encodeURIComponent(imageId)}`),
    { method: "DELETE" }
  );
}
