import {
  DEFAULT_LISTING_IMAGE_ID,
  formatAdminGalleryImages as formatAdminGalleryRows,
} from "./businessImages.js";
import {
  buildBusinessImageDeliveryUrl,
  buildBusinessImagePublicId,
  deleteCloudflareImage,
} from "../cdn-upload/cloudflareImages.js";
import {
  deleteOwnedBusinessImageRow,
  listBusinessImagesByBusinessId,
  setOwnedBusinessHideDefaultImage,
  setOwnedBusinessImageHidden,
  setOwnedBusinessImagePrimary,
} from "../supabase/supabase.functions.js";

const PRIMARY_HIDDEN_MESSAGE =
  "The primary photo cannot be hidden. Set another photo as primary first.";

export function formatAdminGalleryImages(business) {
  return formatAdminGalleryRows(business).map((image) => ({
    ...image,
    image_url: image.is_default
      ? image.image_url
      : buildBusinessImageDeliveryUrl(business?.id, image.image_id),
  }));
}

export async function hideAdminBusinessImage({
  businessId,
  imageId,
  isHidden,
  imageUrl,
  hideDefaultImage,
}) {
  const { data: rows, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return {
      status: 500,
      message: "There was an error loading listing photos.",
      error: listError,
    };
  }

  if (imageId === DEFAULT_LISTING_IMAGE_ID) {
    if (!imageUrl) {
      return { status: 404, message: "That photo could not be found." };
    }

    if (Boolean(hideDefaultImage) === Boolean(isHidden)) {
      return { status: 200, primaryChanged: false };
    }

    const defaultIsPrimary = !rows.some((row) => row.is_primary);
    if (isHidden && defaultIsPrimary) {
      return { status: 422, message: PRIMARY_HIDDEN_MESSAGE };
    }

    const { error: hideError } = await setOwnedBusinessHideDefaultImage(
      businessId,
      isHidden
    );
    if (hideError) {
      return {
        status: 500,
        message: "There was an error updating this photo.",
        error: hideError,
      };
    }

    return { status: 200, primaryChanged: true };
  }

  const current = rows.find((row) => row.image_id === imageId);
  if (!current) {
    return { status: 404, message: "That photo could not be found." };
  }

  if (Boolean(current.is_hidden) === Boolean(isHidden)) {
    return { status: 200, primaryChanged: false };
  }

  if (isHidden && current.is_primary) {
    return { status: 422, message: PRIMARY_HIDDEN_MESSAGE };
  }

  const { error: updateError } = await setOwnedBusinessImageHidden({
    businessId,
    imageId,
    isHidden,
  });
  if (updateError) {
    return {
      status: 500,
      message: "There was an error updating this photo.",
      error: updateError,
    };
  }

  return { status: 200, primaryChanged: false };
}

export async function deleteAdminBusinessImage({ businessId, imageId }) {
  const { data: rows, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return {
      status: 500,
      message: "There was an error loading listing photos.",
      error: listError,
    };
  }

  const current = rows.find((row) => row.image_id === imageId);
  if (!current) {
    return { status: 404, message: "That photo could not be found." };
  }

  if (current.is_primary) {
    const promoted =
      rows
        .filter((row) => row.image_id !== imageId)
        .slice()
        .sort((a, b) => {
          const aTime = Date.parse(a.created_at || "") || 0;
          const bTime = Date.parse(b.created_at || "") || 0;
          return aTime - bTime;
        })[0] || null;

    if (promoted) {
      const { error: promoteError } = await setOwnedBusinessImagePrimary({
        businessId,
        imageId: promoted.image_id,
      });
      if (promoteError) {
        return {
          status: 500,
          message: "There was an error updating the primary photo.",
          error: promoteError,
        };
      }
    }
  }

  const { data: removed, error: deleteError } =
    await deleteOwnedBusinessImageRow({ businessId, imageId });
  if (deleteError || !removed) {
    return {
      status: 500,
      message: "There was an error removing this photo.",
      error: deleteError,
    };
  }

  try {
    await deleteCloudflareImage(
      buildBusinessImagePublicId(businessId, imageId)
    );
  } catch {
    // listing row is gone; CF cleanup is best-effort
  }

  return { status: 200, primaryChanged: Boolean(current.is_primary) };
}
