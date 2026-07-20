import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  getBusinessById,
  insertContactMessage,
} from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";

const { SUPABASE_ERROR, ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR } = errorCodes;

const URGENCY_MAP = {
  asap: 1,
  "can-wait": 2,
};

export const createContactMessage = async (req, res) => {
  const {
    businessId,
    name,
    email,
    phone,
    vehicleModel,
    issue,
    urgency,
    additionalDetails,
  } = req.body;

  // Check Business
  if (businessId) {
    const { data: business, error: businessError } =
      await getBusinessById(businessId);

    if (businessError || !business) {
      return res
        .status(404)
        .json(
          customErrorHandler(
            ROUTE_NOT_FOUND,
            "The selected business could not be found."
          )
        );
    }
  }

  // Verify Email
  const trimmedEmail = email.trim();
  const emailCheck = await verifyEmailReputation(trimmedEmail);

  if (!emailCheck.ok) {
    const { error: verifyError } = emailCheck;

    if (verifyError.type === "undeliverable") {
      return res.status(422).json(
        customErrorHandler(YUP_ERROR, {
          email: verifyError.message,
        })
      );
    }

    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          verifyError.message || "Unable to verify email address right now.",
          verifyError.cause
        )
      );
  }

  // Insert Contact Message
  const { data, error } = await insertContactMessage({
    business_id: businessId || null,
    name: name.trim(),
    email: trimmedEmail,
    phone: phone?.trim() || "",
    vehicle: vehicleModel?.trim() || null,
    issue,
    urgency: URGENCY_MAP[urgency],
    additional_details: additionalDetails?.trim() || null,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your contact message.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  return res.status(201).json(
    successHandler({
      contactMessageId: data.contact_message_id,
    })
  );
};
