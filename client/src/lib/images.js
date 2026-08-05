// Production: skip /_next/image for Google-hosted fallbacks (502 / hotlink issues on Vercel).
// Cloudinary assets use next-cloudinary (CldImage) and do not need this bypass.
export const bypassImageOptimizer = process.env.NODE_ENV === "production";

function getCloudinaryEnvFolder() {
  const explicit = process.env.NEXT_PUBLIC_CLOUDINARY_ENV?.trim();
  if (explicit) return explicit;
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

/**
 * Resolves Cloudinary public_id for a business image.
 * Prefers new path: {env}/business/{businessId}/{imageId}
 * Falls back to legacy Helper uploads: business/{placeId}
 */
export function getCloudinaryPublicId({
  businessId,
  imageId,
  placeId,
  cdnStored = false,
} = {}) {
  const trimmedBusinessId =
    typeof businessId === "string" ? businessId.trim() : "";
  const trimmedImageId = typeof imageId === "string" ? imageId.trim() : "";

  if (trimmedBusinessId && trimmedImageId) {
    return `${getCloudinaryEnvFolder()}/business/${trimmedBusinessId}/${trimmedImageId}`;
  }

  const trimmedPlaceId = typeof placeId === "string" ? placeId.trim() : "";
  if (cdnStored && trimmedPlaceId) {
    return `business/${trimmedPlaceId}`;
  }

  return null;
}

/**
 * Absolute image URL for OG / JSON-LD.
 * Prefers Cloudinary when available; otherwise image_url.
 */
export function getBusinessDisplayImage({
  cdn_stored,
  place_id,
  image_url,
  id,
  primary_image_id,
} = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const publicId = getCloudinaryPublicId({
    businessId: id,
    imageId: primary_image_id,
    placeId: place_id,
    cdnStored: Boolean(cdn_stored),
  });

  if (cdn_stored && cloudName && publicId) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  }

  if (typeof image_url === "string" && image_url.trim()) {
    return image_url.trim();
  }

  return null;
}
