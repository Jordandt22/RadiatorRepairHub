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

const { SUPABASE_ERROR, ROUTE_NOT_FOUND } = errorCodes;

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

  const { data, error } = await insertContactMessage({
    business_id: businessId || null,
    name: name.trim(),
    email: email.trim(),
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
