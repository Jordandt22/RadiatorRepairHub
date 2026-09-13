// Skip /_next/image for Google-hosted fallbacks (403/502 hotlink blocks) and
// Cloudflare Images URLs (already optimized at the edge).
export const bypassImageOptimizer = true;

/** Listing card thumbs — search/grid (1→2→3→4 cols). */
export const BUSINESS_CARD_IMAGE_SIZES =
  "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw";

/**
 * Home / featured carousels: full-bleed on small screens, ~1/3 width in the
 * desktop 3-up track (often ~220px). Oversized `sizes` made browsers pick 640w.
 */
export const HOME_CAROUSEL_CARD_IMAGE_SIZES =
  "(max-width: 767px) 100vw, 33vw";

/** Featured full-row listing card image. */
export const BUSINESS_FEATURED_CARD_IMAGE_SIZES =
  "(max-width: 767px) 100vw, 320px";

/** About / secondary listing image. */
export const BUSINESS_ABOUT_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 480px";

/** Listing photo carousel thumbs. */
export const BUSINESS_GALLERY_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 50vw";

/** Listing photo lightbox. */
export const BUSINESS_LIGHTBOX_IMAGE_SIZES = "100vw";

/** Business detail hero. */
export const BUSINESS_HERO_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 1200px";

/** Homepage hero (pre-optimized static assets — responsive srcset). */
export const HOME_HERO_IMAGE_PATH = "/assets/images/rrh-hero-image.webp";
export const HOME_HERO_IMAGE_SIZES = "100vw";
export const HOME_HERO_IMAGE_SRCSET = [
  "/assets/images/rrh-hero-image-640.webp 640w",
  "/assets/images/rrh-hero-image-750.webp 750w",
  "/assets/images/rrh-hero-image.webp 1280w",
].join(", ");

/** Responsive hero widths for Cloudflare Images srcset. */
export const CF_IMAGE_HERO_WIDTHS = [640, 828, 1080, 1200];

/**
 * Card thumb widths. Cap at 480 — home 3-up slots are ~220 CSS px; 640w was
 * routinely selected and flagged by Lighthouse (~125 KiB wasted).
 */
export const CF_IMAGE_CARD_WIDTHS = [240, 320, 480];

function buildHeroVariant(width) {
  const quality = width <= 640 ? 70 : 75;
  return `w=${width},fit=cover,f=auto,q=${quality}`;
}

function buildCardVariant(width) {
  // Aggressive quality — listing thumbs are small and sit under UI chrome.
  const quality = width <= 240 ? 55 : width <= 320 ? 58 : 60;
  return `w=${width},fit=cover,f=auto,q=${quality}`;
}

/** Flexible variants for Cloudflare Images delivery. */
export const CF_IMAGE_VARIANT = {
  card: buildCardVariant(320),
  card240: buildCardVariant(240),
  card320: buildCardVariant(320),
  card480: buildCardVariant(480),
  about: "w=480,fit=cover,f=auto,q=65",
  gallery: "w=800,fit=cover,f=auto,q=75",
  hero: buildHeroVariant(1200),
  hero640: buildHeroVariant(640),
  hero828: buildHeroVariant(828),
  hero1080: buildHeroVariant(1080),
  hero1200: buildHeroVariant(1200),
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

/** next/image treats null/undefined src as "", which triggers preload warnings. */
export function usableImageSrc(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
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
 * Example: https://images.radiatorrepairhub.com/images/{id}/w=320,fit=cover,f=auto,q=58
 */
export function buildCfImageUrl(imageId, variant = CF_IMAGE_VARIANT.card) {
  const base = getCfImagesBaseUrl();
  if (!base || !imageId) return null;
  return `${base}/${imageId}/${variant}`;
}

/**
 * Builds a responsive srcset for business hero images on Cloudflare Images.
 */
export function buildCfHeroSrcSet(
  imageId,
  widths = CF_IMAGE_HERO_WIDTHS
) {
  if (!imageId) return null;

  const entries = widths
    .map((width) => {
      const url = buildCfImageUrl(imageId, buildHeroVariant(width));
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean);

  return entries.length > 0 ? entries.join(", ") : null;
}

/**
 * Builds a responsive srcset for listing card thumbs on Cloudflare Images.
 * `sizes` on the img picks among these so ~216px slots don't download 400w.
 */
export function buildCfCardSrcSet(
  imageId,
  widths = CF_IMAGE_CARD_WIDTHS
) {
  if (!imageId) return null;

  const entries = widths
    .map((width) => {
      const url = buildCfImageUrl(imageId, buildCardVariant(width));
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean);

  return entries.length > 0 ? entries.join(", ") : null;
}

/**
 * CDN hero image with responsive srcset when the listing image is on Cloudflare.
 */
export function getBusinessHeroCdnImage({
  cdn_stored,
  id,
  primary_image_id,
} = {}) {
  const imageId = getBusinessImageId({
    businessId: id,
    imageId: primary_image_id,
    cdnStored: Boolean(cdn_stored),
  });

  if (!imageId) return null;

  const srcSet = buildCfHeroSrcSet(imageId);
  const src = buildCfImageUrl(imageId, buildHeroVariant(828));

  if (!src || !srcSet) return null;

  return {
    src,
    srcSet,
    sizes: BUSINESS_HERO_IMAGE_SIZES,
  };
}

/**
 * Hero image for the listing banner. Prefers CDN srcset; falls back to image_url
 * (same source as the default photo in the Photos section).
 */
export function getBusinessHeroImage({
  cdn_stored,
  id,
  primary_image_id,
  image_url,
  hide_default_image,
} = {}) {
  const fallbackSrc =
    hide_default_image ? null : usableImageSrc(image_url);

  const cdnHero = getBusinessHeroCdnImage({
    cdn_stored,
    id,
    primary_image_id,
  });

  if (cdnHero) {
    return {
      ...cdnHero,
      fallbackSrc,
    };
  }

  if (!fallbackSrc) return null;

  return {
    src: fallbackSrc,
    sizes: BUSINESS_HERO_IMAGE_SIZES,
    fallbackSrc: null,
  };
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
  hide_default_image,
} = {}) {
  const imageId = getBusinessImageId({
    businessId: id,
    imageId: primary_image_id,
    cdnStored: Boolean(cdn_stored),
  });
  const cdnUrl = buildCfImageUrl(imageId, CF_IMAGE_VARIANT.og);

  if (cdnUrl) return cdnUrl;

  if (hide_default_image) return null;

  if (typeof image_url === "string" && image_url.trim()) {
    return image_url.trim();
  }

  return null;
}
