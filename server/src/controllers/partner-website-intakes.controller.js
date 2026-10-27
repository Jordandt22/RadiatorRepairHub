import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  mapPartnerWebsiteIntake,
  normalizePartnerWebsiteIntakePayload,
} from "../lib/partnerWebsiteIntake.js";
import { supabase } from "../supabase/supabase.js";
import { getOwnedBusiness } from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

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

export const getPartnerWebsiteIntakeHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data, error } = await supabase
    .from("partner_website_intakes")
    .select("business_id, status, payload, submitted_at, updated_at")
    .eq("business_id", business.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
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

export const submitPartnerWebsiteIntakeHandler = async (req, res) => {
  const business = await loadOwnedPartnerBusiness(req, res);
  if (!business) return;

  const { data: existing, error: existingError } = await supabase
    .from("partner_website_intakes")
    .select("status")
    .eq("business_id", business.id)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load website setup details.",
        existingError
      )
    );
  }

  if (existing?.status === "submitted") {
    return res.status(409).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Website details were already submitted for this listing."
      )
    );
  }

  const { payload, errors } = normalizePartnerWebsiteIntakePayload(req.body);
  if (Object.keys(errors).length) {
    return res.status(422).json(customErrorHandler(YUP_ERROR, errors));
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("partner_website_intakes")
    .upsert(
      {
        business_id: business.id,
        status: "submitted",
        payload,
        submitted_at: now,
        updated_at: now,
      },
      { onConflict: "business_id" }
    )
    .select("business_id, status, payload, submitted_at, updated_at")
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
