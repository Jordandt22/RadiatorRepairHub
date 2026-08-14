// Skip /_next/image for Google-hosted fallbacks (403/502 hotlink blocks) and
// Cloudflare Images URLs (already optimized at the edge).
export const bypassImageOptimizer = true;

/** Listing card thumbs. */
export const BUSINESS_CARD_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 400px";

/** About / secondary listing image. */
export const BUSINESS_ABOUT_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 480px";

/** Business detail hero. */
export const BUSINESS_HERO_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 1200px";

/** Flexible variants for Cloudflare Images delivery. */
export const CF_IMAGE_VARIANT = {
  card: "w=400,fit=cover,f=auto,q=75",
  about: "w=480,fit=cover,f=auto,q=75",
  hero: "w=1200,fit=cover,f=auto,q=80",
  og: "w=1200,fit=scale-down,f=auto,q=80",
};

function getCdnEnvFolder() {
  const explicit = process.env.NEXT_PUBLIC_CF_IMAGES_ENV?.trim();
  if (explicit) return explicit;
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

function getCfImagesBaseUrl() {
  const base = process.env.NEXT_PUBLIC_CF_IMAGES_BASE_URL?.trim();
  if (!base) return null;
  return base.replace(/\/+$/, "");
}

/**
 * Resolves Cloudflare Images custom id for a business image.
 * Path: {env}/business/{businessId}/{imageId}
 */
export function getBusinessImageId({
  businessId,
  imageId,
  cdnStored = false,
} = {}) {
  if (!cdnStored) return null;

  const trimmedBusinessId =
    typeof businessId === "string" ? businessId.trim() : "";
  const trimmedImageId = typeof imageId === "string" ? imageId.trim() : "";

  if (trimmedBusinessId && trimmedImageId) {
    return `${getCdnEnvFolder()}/business/${trimmedBusinessId}/${trimmedImageId}`;
  }

  return null;
}

/**
 * Absolute Cloudflare Images delivery URL via custom domain rewrite.
 * Example: https://radiatorrepairhub.com/images/{id}/w=400,fit=cover,f=auto,q=75
 */
export function buildCfImageUrl(imageId, variant = CF_IMAGE_VARIANT.card) {
  const base = getCfImagesBaseUrl();
  if (!base || !imageId) return null;
  return `${base}/${imageId}/${variant}`;
}

/**
 * Absolute image URL for OG / JSON-LD.
 * Prefers a capped Cloudflare Images derivative; otherwise image_url.
 */
export function getBusinessDisplayImage({
  cdn_stored,
  image_url,
  id,
  primary_image_id,
} = {}) {
  const imageId = getBusinessImageId({
    businessId: id,
    imageId: primary_image_id,
    cdnStored: Boolean(cdn_stored),
  });
  const cdnUrl = buildCfImageUrl(imageId, CF_IMAGE_VARIANT.og);

  if (cdnUrl) return cdnUrl;

  if (typeof image_url === "string" && image_url.trim()) {
    return image_url.trim();
  }

  return null;
}
