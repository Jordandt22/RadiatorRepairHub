export const CLAIMED_IMAGE_LIMIT = 3;
export const FEATURED_IMAGE_LIMIT = 10;
export const DEFAULT_LISTING_IMAGE_ID = "listing-default";
export const MAX_OWNER_IMAGE_BYTES = 5 * 1024 * 1024;
export const OWNER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function getBusinessImageLimit({ isFeatured } = {}) {
  return isFeatured ? FEATURED_IMAGE_LIMIT : CLAIMED_IMAGE_LIMIT;
}

function sortByCreatedAt(a, b) {
  const aTime = Date.parse(a?.created_at || "") || 0;
  const bTime = Date.parse(b?.created_at || "") || 0;
  return aTime - bTime;
}

function sortByGalleryOrder(a, b) {
  const aOrder = Number(a?.sort_order ?? 0);
  const bOrder = Number(b?.sort_order ?? 0);
  if (aOrder !== bOrder) return aOrder - bOrder;
  return sortByCreatedAt(a, b);
}

function toPublicImage(row) {
  return {
    image_id: row.image_id,
    is_primary: Boolean(row.is_primary),
  };
}

function finalizePublicGalleryImage(image) {
  if (image.is_default) {
    return {
      image_id: image.image_id,
      is_primary: image.is_primary,
      visible: image.visible,
      is_default: true,
      image_url: image.image_url,
    };
  }

  return {
    image_id: image.image_id,
    is_primary: Boolean(image.is_primary),
    image_url: null,
    is_default: false,
  };
}

/**
 * Public card / banner / OG cover. Hidden stored primaries and a hidden
 * original listing photo are never used as the cover.
 */
export function applyPublicCoverImage(business, images = []) {
  if (!business) return business;

  const primary = (Array.isArray(images) ? images : []).find(
    (image) => image?.is_primary && !image?.is_hidden && image?.image_id
  );
  business.primary_image_id = primary?.image_id ?? null;

  if (business.hide_default_image) {
    business.image_url = null;
  }

  return business;
}

function orderGalleryImages(images) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) return list;

  const primary = list.find((image) => image.is_primary);
  const rest = list
    .filter((image) => image !== primary)
    .slice()
    .sort(sortByGalleryOrder);

  return primary ? [primary, ...rest] : rest;
}

export function withDefaultListingImage(
  images,
  {
    imageUrl,
    hideDefaultImage = false,
    includeHiddenDefault = false,
    hasStoredPrimary,
    defaultImageSortOrder = 0,
  } = {}
) {
  const stored = (Array.isArray(images) ? images.filter(Boolean) : [])
    .filter(
      (image) =>
        image.image_id &&
        image.image_id !== DEFAULT_LISTING_IMAGE_ID &&
        !image.is_default
    )
    .map((image) => ({
      ...image,
      image_url: null,
      is_default: false,
    }));

  const includeDefault =
    Boolean(imageUrl) && (!hideDefaultImage || includeHiddenDefault);

  if (!includeDefault) {
    return orderGalleryImages(stored);
  }

  const defaultIsPrimary =
    typeof hasStoredPrimary === "boolean"
      ? !hasStoredPrimary
      : !stored.some((image) => image.is_primary);

  const defaultImage = {
    image_id: DEFAULT_LISTING_IMAGE_ID,
    is_primary: defaultIsPrimary,
    visible: !hideDefaultImage,
    is_default: true,
    image_url: imageUrl,
    sort_order: Number(defaultImageSortOrder ?? 0),
  };

  if (includeHiddenDefault) {
    defaultImage.is_hidden = Boolean(hideDefaultImage);
  }

  return orderGalleryImages([defaultImage, ...stored]);
}

/**
 * Public gallery for a listing detail page.
 * The original listing photo (image_url) is included when present.
 * Unclaimed listings only show that default. Claimed listings include
 * stored extras, sliced to the current entitlement, with the primary first.
 */
export function selectPublicGalleryImages(
  rows,
  {
    isClaimed,
    isFeatured,
    imageUrl,
    hideDefaultImage = false,
    defaultImageSortOrder = 0,
  } = {}
) {
  const images = Array.isArray(rows) ? rows.filter((row) => row?.image_id) : [];
  const visibleImages = images.filter((row) => !row.is_hidden);
  const hasStoredPrimary = visibleImages.some((row) => row.is_primary);
  const primary = visibleImages.find((row) => row.is_primary) || null;

  if (!isClaimed) {
    if (imageUrl) {
      return hideDefaultImage
        ? []
        : withDefaultListingImage([], { imageUrl });
    }
    return primary ? [toPublicImage(primary)] : [];
  }

  const limit = getBusinessImageLimit({ isFeatured: Boolean(isFeatured) });
  const others = visibleImages
    .filter((row) => !row.is_primary)
    .slice()
    .sort(sortByGalleryOrder);
  const ordered = primary ? [primary, ...others] : others;
  const stored = ordered.slice(0, limit).map((row) => ({
    image_id: row.image_id,
    is_primary: Boolean(row.is_primary),
    is_hidden: Boolean(row.is_hidden),
    created_at: row.created_at,
    sort_order: Number(row.sort_order ?? 0),
  }));

  return withDefaultListingImage(stored, {
    imageUrl,
    hideDefaultImage,
    hasStoredPrimary,
    defaultImageSortOrder,
  }).map(finalizePublicGalleryImage);
}

export function detectImageMime(buffer) {
  if (!buffer || buffer.length < 3) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function formatAdminGalleryImages(business) {
  const rows = Array.isArray(business?.business_images)
    ? business.business_images
    : [];
  const imageUrl = business?.image_url || null;
  const hideDefaultImage = Boolean(business?.hide_default_image);
  const publicImages = selectPublicGalleryImages(rows, {
    isClaimed: Boolean(business?.is_claimed),
    isFeatured: Boolean(business?.is_featured),
    imageUrl,
    hideDefaultImage,
    defaultImageSortOrder: business?.default_image_sort_order,
  });
  const visibleIds = new Set(publicImages.map((image) => image.image_id));

  return withDefaultListingImage(rows, {
    imageUrl,
    hideDefaultImage,
    includeHiddenDefault: true,
    defaultImageSortOrder: business?.default_image_sort_order,
  })
    .filter((image) => image?.image_id)
    .map((image) => ({
      image_id: image.image_id,
      is_primary: Boolean(image.is_primary),
      is_hidden: Boolean(image.is_hidden),
      is_default: Boolean(image.is_default),
      visible: visibleIds.has(image.image_id),
      created_at: image.created_at ?? null,
      sort_order: image.sort_order ?? null,
      image_url: image.is_default ? imageUrl : null,
    }));
}
