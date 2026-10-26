import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import {
  getBusinessOwnerAndTestFlag,
  incrementBusinessStatRpc,
} from "../supabase/supabase.functions.js";
import { businessStatDateKey } from "../lib/businessStatsDate.js";

const { SUPABASE_ERROR, ROUTE_NOT_FOUND, SERVER_ERROR } = errorCodes;

export const createBusinessStatEvent = async (req, res) => {
  const { businessId, event, source, position } = req.body;

  const { data: business, error: businessError } =
    await getBusinessOwnerAndTestFlag(businessId);

  if (businessError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying the business.",
          businessError
        )
      );
  }

  if (!business?.id) {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "Business not found."));
  }

  if (business.is_test) {
    return res.status(204).end();
  }

  if (req.user?.id && req.user.id === business.owner_uid) {
    return res.status(204).end();
  }

  const { error } = await incrementBusinessStatRpc({
    businessId,
    statDate: businessStatDateKey(),
    event,
    source: source ?? null,
    position: position ?? null,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error recording the listing event.",
          error
        )
      );
  }

  return res.status(204).end();
};
