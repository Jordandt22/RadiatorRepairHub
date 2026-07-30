import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { supabase } from "../supabase/supabase.js";
import { expireStalePendingClaimsForBusiness } from "../lib/claimHelpers.js";

const { SUPABASE_ERROR } = errorCodes;

/**
 * For GET /businesses/:business_slug — if the business exists and is not claimed,
 * expire any pending claim requests with last_attempted_at older than 1 day.
 */
export const expireStaleClaimsOnBusinessFetch = serverErrorCatcherWrapper(
  async (req, res, next) => {
    const { business_slug } = req.params;
    if (!business_slug) return next();

    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, is_claimed")
      .eq("slug", business_slug)
      .maybeSingle();

    if (error) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error fetching business claim status.",
            error
          )
        );
    }

    // Let the controller handle missing businesses / full fetch.
    if (!business || business.is_claimed) {
      return next();
    }

    const { error: expireError } = await expireStalePendingClaimsForBusiness(
      business.id
    );

    if (expireError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error expiring stale claim requests.",
            expireError
          )
        );
    }

    return next();
  }
);
