import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { verifyUnsubscribeToken } from "../lib/unsubscribeToken.js";
import {
  getBusinessTitleById,
  insertBulkEmailSuppressions,
  disableWeeklyDigestForBusiness,
} from "../supabase/supabase.functions.js";

const { YUP_ERROR, SERVER_ERROR, SUPABASE_ERROR } = errorCodes;

async function applyUnsubscribe(token) {
  const verified = verifyUnsubscribeToken(token);
  if (!verified.ok) {
    return { ok: false, status: 400, reason: verified.reason };
  }

  const { businessId, email, type } = verified.payload;
  const { data: business, error: businessError } =
    await getBusinessTitleById(businessId);
  if (businessError) {
    return { ok: false, status: 500, error: businessError };
  }
  if (!business) {
    return { ok: false, status: 404, reason: "business_not_found" };
  }

  // One unsubscribe stops outreach + weekly digests for this address.
  const { error } = await insertBulkEmailSuppressions({
    businessId,
    email,
    source: "unsubscribe_link",
  });
  if (error) {
    return { ok: false, status: 500, error };
  }

  // Keep claimed Settings → Notifications toggle in sync with unsubscribe.
  const { error: preferenceError } =
    await disableWeeklyDigestForBusiness(businessId);
  if (preferenceError) {
    return { ok: false, status: 500, error: preferenceError };
  }

  return {
    ok: true,
    data: {
      businessId: business.id,
      businessName: business.title,
      businessSlug: business.slug,
      isClaimed: Boolean(business.is_claimed),
      email,
      type,
      weeklyDigestEnabled: false,
    },
  };
}

function tokenFromRequest(req) {
  return (
    (typeof req.query?.token === "string" && req.query.token) ||
    (typeof req.body?.token === "string" && req.body.token) ||
    ""
  );
}

export const unsubscribeEmailGet = async (req, res) => {
  const token = tokenFromRequest(req);
  if (!token) {
    return res.status(400).json(
      customErrorHandler(YUP_ERROR, {
        token: "Unsubscribe token is required.",
      })
    );
  }

  const result = await applyUnsubscribe(token);
  if (!result.ok) {
    if (result.status === 500) {
      return res.status(500).json(
        customErrorHandler(
          result.error ? SUPABASE_ERROR : SERVER_ERROR,
          "Unable to unsubscribe.",
          result.error
        )
      );
    }
    return res.status(result.status).json(
      customErrorHandler(YUP_ERROR, {
        token: "This unsubscribe link is invalid or expired.",
      })
    );
  }

  return res.status(200).json(successHandler(result.data));
};

export const unsubscribeEmailPost = async (req, res) => {
  const token = tokenFromRequest(req);
  if (!token) {
    return res.status(400).end();
  }

  const result = await applyUnsubscribe(token);
  if (!result.ok) {
    return res.status(result.status === 500 ? 500 : 400).end();
  }
  return res.status(200).end();
};
