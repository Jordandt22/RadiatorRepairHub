// Production: skip /_next/image for Google-hosted fallbacks (502 / hotlink issues on Vercel).
// Cloudinary assets use next-cloudinary (CldImage) and do not need this bypass.
export const bypassImageOptimizer = process.env.NODE_ENV === "production";

/** Matches RRH-Helper uploadPlacePhotos public_id: business/{place_id} */
export function getCloudinaryPublicId(placeId) {
  if (!placeId || typeof placeId !== "string") return null;
  const trimmed = placeId.trim();
  if (!trimmed) return null;
  return `business/${trimmed}`;
}

/**
 * Absolute image URL for OG / JSON-LD.
 * Prefers Cloudinary when cdn_stored; otherwise image_url.
 */
export function getBusinessDisplayImage({
  cdn_stored,
  place_id,
  image_url,
} = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const publicId = getCloudinaryPublicId(place_id);

  if (cdn_stored && cloudName && publicId) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  }

  if (typeof image_url === "string" && image_url.trim()) {
    return image_url.trim();
  }

  return null;
}
