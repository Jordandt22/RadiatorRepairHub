import { fetchAuthenticatedApi } from "./fetchAuthenticatedApi";

export async function fetchOwnedBusinessImages({ businessId }) {
  return fetchAuthenticatedApi(
    `/businesses/images?businessId=${encodeURIComponent(businessId)}`
  );
}

export async function uploadOwnedBusinessImage({ businessId, file }) {
  const body = new FormData();
  body.append("businessId", businessId);
  body.append("image", file);
  return fetchAuthenticatedApi("/businesses/images", {
    method: "POST",
    body,
  });
}

export async function setOwnedBusinessImagePrimary({ businessId, imageId }) {
  return fetchAuthenticatedApi("/businesses/images/primary", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, imageId }),
  });
}

export async function setOwnedBusinessImageHidden({
  businessId,
  imageId,
  isHidden,
}) {
  return fetchAuthenticatedApi("/businesses/images/hidden", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, imageId, isHidden }),
  });
}

export async function deleteOwnedBusinessImage({ businessId, imageId }) {
  return fetchAuthenticatedApi("/businesses/images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, imageId }),
  });
}

export async function reorderOwnedBusinessImages({ businessId, imageIds }) {
  return fetchAuthenticatedApi("/businesses/images/order", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, imageIds }),
  });
}
