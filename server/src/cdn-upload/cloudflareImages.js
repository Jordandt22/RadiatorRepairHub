/**
 * Cloudflare Images upload helpers for business CDN photos.
 * Delivery ids: {env}/business/{businessId}/{imageId}
 */

export function getCdnEnvFolder() {
  const explicit = process.env.CF_IMAGES_ENV?.trim();
  if (explicit) return explicit;
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

/** Delivery image id: {env}/business/{businessId}/{imageId} */
export function buildBusinessImagePublicId(businessId, imageId) {
  return `${getCdnEnvFolder()}/business/${businessId}/${imageId}`;
}

const ADMIN_GALLERY_VARIANT = "w=800,fit=cover,f=auto,q=80";

const PUBLIC_CF_IMAGES_BASE = "https://images.radiatorrepairhub.com/images";

function isLocalHostname(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

function getCfImagesDeliveryBase() {
  const explicit = process.env.CF_IMAGES_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const webUrl = process.env.WEB_URL?.trim();
  if (webUrl && !isLocalHostname(webUrl)) {
    return `${webUrl.replace(/\/+$/, "")}/images`;
  }
  return PUBLIC_CF_IMAGES_BASE;
}

/** Public delivery URL for a stored business image. */
export function buildBusinessImageDeliveryUrl(
  businessId,
  imageId,
  variant = ADMIN_GALLERY_VARIANT
) {
  const base = getCfImagesDeliveryBase();
  if (!base || !businessId || !imageId) return null;
  return `${base}/${buildBusinessImagePublicId(businessId, imageId)}/${variant}`;
}

function getCloudflareImagesCredentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken =
    process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim() ||
    process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    throw new Error(
      "Missing Cloudflare Images credentials. Need CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN (or CLOUDFLARE_API_TOKEN)."
    );
  }

  return { accountId, apiToken };
}

function formatCloudflareError(payload, status) {
  return (
    payload?.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
    payload?.messages?.map((m) => m.message).filter(Boolean).join("; ") ||
    `HTTP ${status}`
  );
}

export async function deleteCloudflareImage(publicId) {
  const { accountId, apiToken } = getCloudflareImagesCredentials();
  const encodedId = encodeURIComponent(publicId);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${encodedId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  // 404 = already gone; treat as success for overwrite-style retries.
  if (response.status === 404) return;

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(
      `Cloudflare Images delete failed: ${formatCloudflareError(
        payload,
        response.status
      )}`
    );
  }
}

async function postCloudflareImage(buffer, publicId) {
  const { accountId, apiToken } = getCloudflareImagesCredentials();

  const form = new FormData();
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  form.append(
    "file",
    new Blob([bytes], { type: "application/octet-stream" }),
    "photo.jpg"
  );
  form.append("id", publicId);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: form,
    }
  );

  const payload = await response.json().catch(() => null);
  return { response, payload };
}

/**
 * Upload an image buffer to Cloudflare Images with a custom id.
 * If the id already exists, delete it and retry once.
 * @returns {Promise<string>} Cloudflare image id
 */
export async function uploadBufferToCloudflareImages(buffer, { publicId }) {
  if (!publicId || typeof publicId !== "string") {
    throw new Error("uploadBufferToCloudflareImages requires publicId");
  }

  let { response, payload } = await postCloudflareImage(buffer, publicId);

  const alreadyExists =
    !response.ok &&
    (response.status === 409 ||
      payload?.errors?.some(
        (e) =>
          /already exists|duplicate/i.test(e?.message || "") || e?.code === 5411
      ));

  if (alreadyExists) {
    await deleteCloudflareImage(publicId);
    ({ response, payload } = await postCloudflareImage(buffer, publicId));
  }

  if (!response.ok || !payload?.success) {
    throw new Error(
      `Cloudflare Images upload failed: ${formatCloudflareError(
        payload,
        response.status
      )}`
    );
  }

  return payload.result?.id ?? publicId;
}
