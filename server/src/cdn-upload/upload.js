import { randomUUID } from "crypto";
import {
  buildBusinessImagePublicId,
  uploadBufferToCloudflareImages,
} from "./cloudflareImages.js";
import {
  getBusinessesByIds,
  incrementCdnStoredAttempts,
  insertPrimaryBusinessImage,
  markBusinessCdnStored,
} from "./db.js";
import {
  fetchPhotoMediaBuffer,
  fetchPlacePhotos,
  getPlacesApiKey,
} from "./places.js";

const DELAY_MIN_MS = 400;
const DELAY_MAX_MS = 600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return (
    DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1))
  );
}

async function processBusiness(business, apiKey) {
  const base = {
    business_id: business.id,
    place_id: business.place_id,
    slug: business.slug,
    title: business.title,
  };

  if (business.cdn_stored) {
    return { ...base, status: "skipped", error: "already_cdn_stored" };
  }

  // Count every real attempt so failures/skips move down the priority queue.
  await incrementCdnStoredAttempts(
    business.id,
    business.cdn_stored_attempts ?? 0
  );

  if (!business.place_id) {
    return { ...base, status: "skipped", error: "missing_place_id" };
  }

  try {
    const photos = await fetchPlacePhotos(business.place_id, apiKey);
    if (!photos.length) {
      return { ...base, status: "skipped", error: "no_photos" };
    }

    const imageId = randomUUID();
    const first = photos[0];
    const { buffer } = await fetchPhotoMediaBuffer(first.name, apiKey);
    const publicId = buildBusinessImagePublicId(business.id, imageId);

    await uploadBufferToCloudflareImages(buffer, { publicId });
    await insertPrimaryBusinessImage({
      imageId,
      businessId: business.id,
    });
    await markBusinessCdnStored(business.id);

    return { ...base, status: "succeeded", image_id: imageId };
  } catch (err) {
    return {
      ...base,
      status: "failed",
      error: err?.message || "Upload failed",
    };
  }
}

export async function processCdnUploadBusinesses(businessIds) {
  const apiKey = getPlacesApiKey();
  const businesses = await getBusinessesByIds(businessIds);
  const results = [];

  for (let i = 0; i < businesses.length; i += 1) {
    const result = await processBusiness(businesses[i], apiKey);
    results.push(result);

    if (i < businesses.length - 1) {
      await sleep(randomDelay());
    }
  }

  // Preserve snapshot order for any IDs that disappeared between enqueue and run.
  const foundIds = new Set(results.map((r) => r.business_id));
  for (const id of businessIds) {
    if (!foundIds.has(id)) {
      results.push({
        business_id: id,
        place_id: null,
        slug: null,
        title: null,
        status: "skipped",
        error: "business_not_found",
      });
    }
  }

  const succeeded_count = results.filter((r) => r.status === "succeeded").length;
  const failed_count = results.filter((r) => r.status === "failed").length;
  const skipped_count = results.filter((r) => r.status === "skipped").length;

  return {
    selected_count: businessIds.length,
    succeeded_count,
    failed_count,
    skipped_count,
    result_payload: results,
  };
}
