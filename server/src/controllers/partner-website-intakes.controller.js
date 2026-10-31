import crypto from "node:crypto";
import path from "node:path";
import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  buildPartnerIntakeImageDeliveryUrl,
  buildPartnerIntakeImagePublicId,
  deleteCloudflareImage,
  uploadBufferToCloudflareImages,
} from "../cdn-upload/cloudflareImages.js";
import {
  detectImageMime,
  MAX_OWNER_IMAGE_BYTES,
  OWNER_IMAGE_MIME_TYPES,
} from "../lib/businessImages.js";
import { getGoogleMapsPlaceUrl } from "../lib/googleMaps.js";
import { normalizeIncomingHours } from "../lib/businessHoursFormat.js";
import {
  INTAKE_SELECT_FIELDS,
  mapPartnerWebsiteIntake,
  mergeIntakePayload,
  MIN_IMAGES,
  normalizeStep1,
  normalizeStep2,
  normalizeStep3,
  normalizeStep4,
  partnerIntakePriorityUntil,
  TOTAL_INTAKE_STEPS,
  validateReadyToSubmit,
} from "../lib/partnerWebsiteIntake.js";
import {
  MAX_MEDIA_CAPTION_LENGTH,
  PARTNER_MEDIA_CONSENT_VERSION,
  assertGalleryCapacity,
  countGalleryImages,
  deletePartnerWebsiteLogo,
  deletePartnerWebsiteMediaByImageId,
  insertPartnerWebsiteMedia,
  listPartnerWebsiteMedia,
  mediaPayloadFromRows,
  nextGallerySortOrder,
  updatePartnerWebsiteMediaCaption,
} from "../lib/partnerWebsiteMedia.js";
import { processPartnerIntakeImage } from "../lib/processPartnerIntakeImage.js";
import { supabase } from "../supabase/supabase.js";
import { getOwnedBusiness } from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

async function loadOwnedPartnerBusiness(req, res) {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
    return null;
  }

  const { businessId } = req.params;
  const { data: business, error } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (error) {
    res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error verifying business ownership.",
        error
      )
    );
    return null;
  }

  if (!business) {
    res
      .status(403)
      .json(
        customErrorHandler(ACCESS_DENIED, "You do not own this business listing.")
      );
    return null;
  }

  if (!business.is_partner) {
    res.status(403).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Website setup is included with a Partner listing."
      )
    );
    return null;
  }

  return business;
}

async function loadListingSnapshot(business) {
  const { data: profile } = await supabase
    .from("businesses")
    .select("id, title, email, phone, address, latitude, longitude, place_id")
    .eq("id", business.id)
    .maybeSingle();

  const { data: hoursRows } = await supabase
    .from("business_hours")
    .select("day_of_week, is_closed, hours, hours_text")
    .eq("business_id", business.id);

  const row = profile || business;
  return {
    title: row.title || "",
    email: row.email || "",
    phone: row.phone || "",
    googleMapsUrl: getGoogleMapsPlaceUrl(row) || "",
    hoursDays: normalizeIncomingHours(hoursRows || []),
  };
}

async function ensureIntakeRow(businessId) {
  const { data: existing, error: readError } = await supabase
    .from("partner_website_intakes")
    .select(INTAKE_SELECT_FIELDS)
    .eq("business_id", businessId)
    .maybeSingle();

  if (readError) return { data: null, error: readError };
  if (existing) return { data: existing, error: null };

  const now = new Date();
  const startedAt = now.toISOString();
  const { data, error } = await supabase
    .from("partner_website_intakes")
    .insert({
      business_id: businessId,
      status: "needs_info",
      payload: {},
      current_step: 1,
      started_at: startedAt,
      priority_until: partnerIntakePriorityUntil(now),
      submitted_at: null,
      updated_at: startedAt,
    })
    .select(INTAKE_SELECT_FIELDS)
    .single();

  if (error?.code === "23505") {
    const retry = await supabase
      .from("partner_website_intakes")
      .select(INTAKE_SELECT_FIELDS)
      .eq("business_id", businessId)
      .maybeSingle();
    return { data: retry.data, error: retry.error };
  }

  return { data, error };
}

function rejectIfSubmitted(res, row) {
  if (row?.status !== "submitted") return false;
  res.status(409).json(
    customErrorHandler(
      ACCESS_DENIED,
      "Website details were already submitted for this listing."
    )
  );
  return true;
}

function validateUploadFile(file) {
  if (!file?.buffer) {
    return { image: "Choose a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_OWNER_IMAGE_BYTES) {
    return { image: "Image must be 5 MB or smaller." };
  }
  const detectedMime = detectImageMime(file.buffer);
  if (
    !detectedMime ||
    !OWNER_IMAGE_MIME_TYPES.includes(detectedMime) ||
    !OWNER_IMAGE_MIME_TYPES.includes(file.mimetype)
  ) {
    return { image: "Use a JPEG, PNG, or WebP image." };
  }
  return null;
}

function hasMediaConsent(row) {
  return Boolean(row?.media_usage_consented_at);
}

function consentUpdateFromBody(body, existing, nowIso) {
  if (body?.mediaUsageConsent === true) {
    if (hasMediaConsent(existing)) return null;
    return {
      media_usage_consented_at: nowIso,
      media_usage_consent_version: PARTNER_MEDIA_CONSENT_VERSION,
    };
  }
  if (body?.mediaUsageConsent === false) {
    if (!hasMediaConsent(existing)) return null;
    return {
      media_usage_consented_at: null,
      media_usage_consent_version: null,
    };
  }
  return null;
}

async function buildIntakeResponse(business, row) {
  const { rows, error } = await listPartnerWebsiteMedia(business.id);
  if (error) return { intake: null, error };
  const listing = await loadListingSnapshot(business);
  const mediaPayload = mediaPayloadFromRows(rows);
  return {
    listing,
    mediaPayload,
    intake: mapPartnerWebsiteIntake(row, listing, { mediaPayload }),
    error: null,
  };
}

async function syncPayloadMedia(businessId, existingPayload, mediaPayload) {
  const nextPayload = mergeIntakePayload(existingPayload, {
    logo: mediaPayload.logo,
    images: mediaPayload.images,
  });
  const now = new Date().toISOString();
  return supabase
    .from("partner_website_intakes")
    .update({ payload: nextPayload, updated_at: now })
    .eq("business_id", businessId)
    .select(INTAKE_SELECT_FIELDS)
    .single();
}

function safeOriginalFilename(file) {
  const raw = String(file?.originalname || "").trim();
  if (!raw) return null;
  return path.basename(raw).slice(0, 200) || null;
}

export const getPartnerWebsiteIntakeHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data, error } = await ensureIntakeRow(business.id);
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        error
      )
    );
  }

  const built = await buildIntakeResponse(business, data);
  if (built.error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        built.error
      )
    );
  }

  return res.status(200).json(
    successHandler({
      businessId: business.id,
      listing: built.listing,
      intake: built.intake,
    })
  );
};

export const patchPartnerWebsiteIntakeHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  const body = req.body || {};
  const soft = body.soft === true;

  if (
    soft &&
    body.consentOnly === true &&
    (body.mediaUsageConsent === true || body.mediaUsageConsent === false)
  ) {
    const now = new Date().toISOString();
    const consentFields = consentUpdateFromBody(body, existing, now) || {};
    const { data, error } = await supabase
      .from("partner_website_intakes")
      .update({
        updated_at: now,
        ...consentFields,
      })
      .eq("business_id", business.id)
      .select(INTAKE_SELECT_FIELDS)
      .single();

    if (error) {
      return res.status(500).json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to save website setup details.",
          error
        )
      );
    }

    const built = await buildIntakeResponse(business, data);
    if (built.error) {
      return res.status(500).json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to load website media.",
          built.error
        )
      );
    }

    return res.status(200).json(
      successHandler({
        businessId: business.id,
        listing: built.listing,
        intake: built.intake,
      })
    );
  }

  const step = Number(req.body?.step);
  if (![1, 2, 3, 4].includes(step)) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        step: `Choose a step between 1 and ${TOTAL_INTAKE_STEPS}.`,
      })
    );
  }
  const { rows: mediaRows, error: mediaError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (mediaError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        mediaError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);
  const bodyWithMedia = {
    ...body,
    logo: mediaPayload.logo,
    images: mediaPayload.images,
  };

  let stepResult;
  if (step === 1) stepResult = normalizeStep1(bodyWithMedia, { soft });
  else if (step === 2) {
    stepResult = normalizeStep2(bodyWithMedia, { requireMedia: true, soft });
  } else if (step === 3) stepResult = normalizeStep3(bodyWithMedia, { soft });
  else stepResult = normalizeStep4(bodyWithMedia);

  const consentIncoming = body.mediaUsageConsent === true;
  const consented = hasMediaConsent(existing) || consentIncoming;
  if (!soft && step === 2 && !consented) {
    stepResult.errors.mediaUsageConsent =
      "Confirm permission to store and use these photos.";
  }

  if (Object.keys(stepResult.errors).length) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, stepResult.errors));
  }

  const nextPayload = mergeIntakePayload(existing.payload, {
    ...stepResult.payload,
    logo: mediaPayload.logo,
    images: mediaPayload.images,
  });
  const nextStep = soft
    ? Math.min(
        TOTAL_INTAKE_STEPS,
        Math.max(step, Number(existing.current_step) || 1)
      )
    : Math.min(
        TOTAL_INTAKE_STEPS,
        Math.max(step + 1, Number(existing.current_step) || 1)
      );
  const now = new Date().toISOString();
  const consentFields = consentUpdateFromBody(body, existing, now) || {};

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({
      payload: nextPayload,
      current_step: nextStep,
      updated_at: now,
      ...consentFields,
    })
    .eq("business_id", business.id)
    .select(INTAKE_SELECT_FIELDS)
    .single();

  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      listing,
      intake: mapPartnerWebsiteIntake(data, listing, { mediaPayload }),
    })
  );
};

export const submitPartnerWebsiteIntakeHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  const { rows: mediaRows, error: mediaError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (mediaError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        mediaError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);

  const merged = mergeIntakePayload(
    existing.payload,
    req.body && typeof req.body === "object" ? req.body : {}
  );
  merged.logo = mediaPayload.logo;
  merged.images = mediaPayload.images;

  const { payload, errors } = validateReadyToSubmit(merged);
  const now = new Date().toISOString();
  const consentIncoming = req.body?.mediaUsageConsent === true;
  const consented = hasMediaConsent(existing) || consentIncoming;
  if (!consented) {
    errors.mediaUsageConsent =
      "Confirm permission to store and use these photos.";
  }
  if ((mediaPayload.images?.length || 0) < MIN_IMAGES) {
    errors.images = `Upload at least ${MIN_IMAGES} images.`;
  }
  if (Object.keys(errors).length) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  }

  const consentFields = consentUpdateFromBody(req.body, existing, now) || {};
  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({
      status: "submitted",
      payload,
      current_step: TOTAL_INTAKE_STEPS,
      submitted_at: now,
      updated_at: now,
      ...consentFields,
    })
    .eq("business_id", business.id)
    .select(INTAKE_SELECT_FIELDS)
    .single();

  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  return res.status(200).json(
    successHandler({
      businessId: business.id,
      intake: mapPartnerWebsiteIntake(data, null, { mediaPayload }),
    })
  );
};

export const uploadPartnerWebsiteIntakeLogoHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  if (!hasMediaConsent(existing)) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        mediaUsageConsent:
          "Confirm permission to store and use these photos before uploading.",
      })
    );
  }

  const fileError = validateUploadFile(req.file);
  if (fileError) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, fileError));
  }

  let processed;
  try {
    processed = await processPartnerIntakeImage(req.file.buffer, {
      kind: "logo",
    });
  } catch {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image:
          "Unable to process this image. Try a different JPEG, PNG, or WebP.",
      })
    );
  }

  const { rows: existingMediaRows } = await listPartnerWebsiteMedia(business.id);
  const previousLogo =
    existingMediaRows.find((row) => row.kind === "logo") || null;

  const imageId = crypto.randomUUID();
  const publicId = buildPartnerIntakeImagePublicId(business.id, "logo", imageId);

  try {
    await uploadBufferToCloudflareImages(processed.buffer, { publicId });
  } catch (uploadError) {
    return res.status(500).json(
      customErrorHandler(
        SERVER_ERROR,
        "There was an error uploading this logo.",
        uploadError
      )
    );
  }

  await deletePartnerWebsiteLogo(business.id);

  const url = buildPartnerIntakeImageDeliveryUrl(business.id, "logo", imageId);
  const { error: insertError } = await insertPartnerWebsiteMedia({
    businessId: business.id,
    kind: "logo",
    imageId,
    url,
    sortOrder: 0,
    originalFilename: safeOriginalFilename(req.file),
    contentType: processed.contentType,
    byteSize: processed.byteSize,
    width: processed.width,
    height: processed.height,
  });

  if (insertError) {
    try {
      await deleteCloudflareImage(publicId);
    } catch {
      // best-effort cleanup
    }
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website logo.",
        insertError
      )
    );
  }

  const { rows: mediaRows, error: listError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        listError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);
  const { data, error } = await syncPayloadMedia(
    business.id,
    existing.payload,
    mediaPayload
  );
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  if (previousLogo?.image_id && previousLogo.image_id !== imageId) {
    try {
      await deleteCloudflareImage(
        buildPartnerIntakeImagePublicId(
          business.id,
          "logo",
          previousLogo.image_id
        )
      );
    } catch {
      // best-effort cleanup
    }
  }

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      logo: mediaPayload.logo,
      intake: mapPartnerWebsiteIntake(data, listing, { mediaPayload }),
    })
  );
};

export const uploadPartnerWebsiteIntakeImageHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  if (!hasMediaConsent(existing)) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        mediaUsageConsent:
          "Confirm permission to store and use these photos before uploading.",
      })
    );
  }

  const fileError = validateUploadFile(req.file);
  if (fileError) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, fileError));
  }

  const { count, error: countError } = await countGalleryImages(business.id);
  if (countError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        countError
      )
    );
  }
  const capacityError = assertGalleryCapacity(count);
  if (capacityError) {
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, { images: capacityError }));
  }

  let processed;
  try {
    processed = await processPartnerIntakeImage(req.file.buffer, {
      kind: "gallery",
    });
  } catch {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image:
          "Unable to process this image. Try a different JPEG, PNG, or WebP.",
      })
    );
  }

  const { sortOrder, error: sortError } = await nextGallerySortOrder(
    business.id
  );
  if (sortError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        sortError
      )
    );
  }

  const imageId = crypto.randomUUID();
  const publicId = buildPartnerIntakeImagePublicId(
    business.id,
    "gallery",
    imageId
  );

  try {
    await uploadBufferToCloudflareImages(processed.buffer, { publicId });
  } catch (uploadError) {
    return res.status(500).json(
      customErrorHandler(
        SERVER_ERROR,
        "There was an error uploading this image.",
        uploadError
      )
    );
  }

  const url = buildPartnerIntakeImageDeliveryUrl(business.id, "gallery", imageId);
  const { error: insertError } = await insertPartnerWebsiteMedia({
    businessId: business.id,
    kind: "gallery",
    imageId,
    url,
    sortOrder,
    originalFilename: safeOriginalFilename(req.file),
    contentType: processed.contentType,
    byteSize: processed.byteSize,
    width: processed.width,
    height: processed.height,
  });

  if (insertError) {
    try {
      await deleteCloudflareImage(publicId);
    } catch {
      // best-effort cleanup
    }
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website image.",
        insertError
      )
    );
  }

  const { rows: mediaRows, error: listError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        listError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);
  const { data, error } = await syncPayloadMedia(
    business.id,
    existing.payload,
    mediaPayload
  );
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      image: { imageId, url },
      intake: mapPartnerWebsiteIntake(data, listing, { mediaPayload }),
    })
  );
};

export const deletePartnerWebsiteIntakeImageHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  const imageId = String(req.params.imageId || "").trim();
  if (!imageId) {
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, { imageId: "Missing image id." }));
  }

  const { rows: deletedRows, error: deleteError } =
    await deletePartnerWebsiteMediaByImageId(business.id, imageId);
  if (deleteError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to remove website image.",
        deleteError
      )
    );
  }
  if (!deletedRows.length) {
    return res
      .status(404)
      .json(customErrorHandler(YUP_ERROR, { imageId: "Image not found." }));
  }

  const { rows: mediaRows, error: listError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        listError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);
  const { data, error } = await syncPayloadMedia(
    business.id,
    existing.payload,
    mediaPayload
  );
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  try {
    await deleteCloudflareImage(
      buildPartnerIntakeImagePublicId(business.id, "gallery", imageId)
    );
  } catch {
    // best-effort cleanup
  }

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      intake: mapPartnerWebsiteIntake(data, listing, { mediaPayload }),
    })
  );
};

export const patchPartnerWebsiteIntakeImageHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await ensureIntakeRow(
    business.id
  );
  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }
  if (rejectIfSubmitted(res, existing)) return;

  const imageId = String(req.params.imageId || "").trim();
  if (!imageId) {
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, { imageId: "Missing image id." }));
  }

  if (!Object.prototype.hasOwnProperty.call(req.body || {}, "caption")) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        caption: "Provide a caption (or an empty string to clear it).",
      })
    );
  }

  const rawCaption = req.body?.caption;
  if (rawCaption != null && typeof rawCaption !== "string") {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        caption: "Caption must be text.",
      })
    );
  }
  if (
    typeof rawCaption === "string" &&
    rawCaption.trim().length > MAX_MEDIA_CAPTION_LENGTH
  ) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        caption: `Keep captions to ${MAX_MEDIA_CAPTION_LENGTH} characters or fewer.`,
      })
    );
  }

  const { row, error: updateError } = await updatePartnerWebsiteMediaCaption(
    business.id,
    imageId,
    rawCaption
  );
  if (updateError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save photo caption.",
        updateError
      )
    );
  }
  if (!row) {
    return res
      .status(404)
      .json(customErrorHandler(YUP_ERROR, { imageId: "Image not found." }));
  }

  const { rows: mediaRows, error: listError } = await listPartnerWebsiteMedia(
    business.id
  );
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website media.",
        listError
      )
    );
  }
  const mediaPayload = mediaPayloadFromRows(mediaRows);
  const { data, error } = await syncPayloadMedia(
    business.id,
    existing.payload,
    mediaPayload
  );
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      image: {
        imageId: row.image_id,
        url: row.url,
        caption: row.caption || "",
      },
      intake: mapPartnerWebsiteIntake(data, listing, { mediaPayload }),
    })
  );
};
