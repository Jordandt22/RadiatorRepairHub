import crypto from "node:crypto";
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
  MAX_IMAGES,
  normalizeStep1,
  normalizeStep2,
  normalizeStep3,
  normalizeStep4,
  partnerIntakePriorityUntil,
  TOTAL_INTAKE_STEPS,
  validateReadyToSubmit,
} from "../lib/partnerWebsiteIntake.js";
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

  const listing = await loadListingSnapshot(business);
  return res.status(200).json(
    successHandler({
      businessId: business.id,
      listing,
      intake: mapPartnerWebsiteIntake(data, listing),
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

  const step = Number(req.body?.step);
  if (![1, 2, 3, 4].includes(step)) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        step: `Choose a step between 1 and ${TOTAL_INTAKE_STEPS}.`,
      })
    );
  }

  const body = req.body || {};
  const soft = body.soft === true;
  let stepResult;
  if (step === 1) stepResult = normalizeStep1(body, { soft });
  else if (step === 2) {
    stepResult = normalizeStep2(body, { requireMedia: true, soft });
  } else if (step === 3) stepResult = normalizeStep3(body, { soft });
  else stepResult = normalizeStep4(body);

  if (Object.keys(stepResult.errors).length) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, stepResult.errors));
  }

  const nextPayload = mergeIntakePayload(existing.payload, stepResult.payload);
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

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({
      payload: nextPayload,
      current_step: nextStep,
      updated_at: now,
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
      intake: mapPartnerWebsiteIntake(data, listing),
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

  const merged = mergeIntakePayload(
    existing.payload,
    req.body && typeof req.body === "object" ? req.body : {}
  );
  const { payload, errors } = validateReadyToSubmit(merged);
  if (Object.keys(errors).length) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({
      status: "submitted",
      payload,
      current_step: TOTAL_INTAKE_STEPS,
      submitted_at: now,
      updated_at: now,
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
      intake: mapPartnerWebsiteIntake(data),
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

  const fileError = validateUploadFile(req.file);
  if (fileError) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, fileError));
  }

  const previousLogo = existing.payload?.logo;
  const imageId = crypto.randomUUID();
  const publicId = buildPartnerIntakeImagePublicId(business.id, "logo", imageId);

  try {
    await uploadBufferToCloudflareImages(req.file.buffer, { publicId });
  } catch (uploadError) {
    return res.status(500).json(
      customErrorHandler(
        SERVER_ERROR,
        "There was an error uploading this logo.",
        uploadError
      )
    );
  }

  const url = buildPartnerIntakeImageDeliveryUrl(business.id, "logo", imageId);
  const logo = { imageId, url };
  const nextPayload = mergeIntakePayload(existing.payload, { logo });
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({ payload: nextPayload, updated_at: now })
    .eq("business_id", business.id)
    .select(INTAKE_SELECT_FIELDS)
    .single();

  if (error) {
    try {
      await deleteCloudflareImage(publicId);
    } catch {
      // best-effort cleanup
    }
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save website setup details.",
        error
      )
    );
  }

  if (previousLogo?.imageId && previousLogo.imageId !== imageId) {
    try {
      await deleteCloudflareImage(
        buildPartnerIntakeImagePublicId(
          business.id,
          "logo",
          previousLogo.imageId
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
      logo,
      intake: mapPartnerWebsiteIntake(data, listing),
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

  const fileError = validateUploadFile(req.file);
  if (fileError) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, fileError));
  }

  const currentImages = Array.isArray(existing.payload?.images)
    ? existing.payload.images.filter((item) => item?.imageId && item?.url)
    : [];
  if (currentImages.length >= MAX_IMAGES) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        images: `You can upload up to ${MAX_IMAGES} images.`,
      })
    );
  }

  const imageId = crypto.randomUUID();
  const publicId = buildPartnerIntakeImagePublicId(
    business.id,
    "gallery",
    imageId
  );

  try {
    await uploadBufferToCloudflareImages(req.file.buffer, { publicId });
  } catch (uploadError) {
    return res.status(500).json(
      customErrorHandler(
        SERVER_ERROR,
        "There was an error uploading this image.",
        uploadError
      )
    );
  }

  const media = {
    imageId,
    url: buildPartnerIntakeImageDeliveryUrl(business.id, "gallery", imageId),
  };
  const nextPayload = mergeIntakePayload(existing.payload, {
    images: [...currentImages, media],
  });
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({ payload: nextPayload, updated_at: now })
    .eq("business_id", business.id)
    .select(INTAKE_SELECT_FIELDS)
    .single();

  if (error) {
    try {
      await deleteCloudflareImage(publicId);
    } catch {
      // best-effort cleanup
    }
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
      image: media,
      intake: mapPartnerWebsiteIntake(data, listing),
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

  const currentImages = Array.isArray(existing.payload?.images)
    ? existing.payload.images.filter((item) => item?.imageId && item?.url)
    : [];
  const nextImages = currentImages.filter((item) => item.imageId !== imageId);
  if (nextImages.length === currentImages.length) {
    return res
      .status(404)
      .json(customErrorHandler(YUP_ERROR, { imageId: "Image not found." }));
  }

  const nextPayload = mergeIntakePayload(existing.payload, {
    images: nextImages,
  });
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .update({ payload: nextPayload, updated_at: now })
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
      intake: mapPartnerWebsiteIntake(data, listing),
    })
  );
};
