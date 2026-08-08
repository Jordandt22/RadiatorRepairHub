// Production: skip /_next/image for Google-hosted fallbacks (502 / hotlink issues on Vercel).
// Cloudinary assets use next-cloudinary (CldImage) and do not need this bypass.
export const bypassImageOptimizer = process.env.NODE_ENV === "production";

/** Listing card thumbs — few breakpoints to limit unique Cloudinary derivatives. */
export const BUSINESS_CARD_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 400px";

/** About / secondary listing image. */
export const BUSINESS_ABOUT_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 480px";

/** Business detail hero. */
export const BUSINESS_HERO_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 1200px";

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
 * Prefers a capped, auto-optimized Cloudinary derivative; otherwise image_url.
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
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto:good,c_limit,w_1200/${publicId}`;
  }

  if (typeof image_url === "string" && image_url.trim()) {
    return image_url.trim();
  }

  return null;
}
