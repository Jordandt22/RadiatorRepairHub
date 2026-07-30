import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  getBusinessClaimInfo,
  insertListingReport,
} from "../supabase/supabase.functions.js";
import { deleteCacheDataByPrefix } from "../redis/redis.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import {
  ADMIN_NEW_LISTING_REPORT_MESSAGE,
  SENDER_NAME,
  buildBusinessClaimLink,
} from "../lib/constants/messages.js";

const { SUPABASE_ERROR, ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR } = errorCodes;

export const createListingReport = async (req, res) => {
  const {
    businessId,
    reason,
    details,
    reporterEmail,
    reporterName,
    suggestedPhone,
    suggestedEmail,
  } = req.body;

  const { data: business, error: businessError } =
    await getBusinessClaimInfo(businessId);

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

  const trimmedEmail = reporterEmail.trim();
  const emailCheck = await verifyEmailReputation(trimmedEmail);

  if (!emailCheck.ok) {
    const { error: verifyError } = emailCheck;

    if (verifyError.type === "undeliverable") {
      return res.status(422).json(
        customErrorHandler(YUP_ERROR, {
          reporterEmail: verifyError.message,
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

  const isWrongContact = reason === "wrong_claim_contact";
  const payload = {
    business_id: businessId,
    reason,
    details: details.trim(),
    reporter_email: trimmedEmail,
    reporter_name: reporterName?.trim() || null,
    suggested_phone: isWrongContact ? suggestedPhone?.trim() || null : null,
    suggested_email: isWrongContact ? suggestedEmail?.trim() || null : null,
  };

  const { data, error } = await insertListingReport(payload);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving your report.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("LISTING_REPORTS");

  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL, INTERNAL_CLIENT_URL } =
    process.env;

  if (RESEND_API_KEY && SENDER_EMAIL && ADMIN_EMAIL) {
    const adminQueueBase = (INTERNAL_CLIENT_URL || "").replace(/\/$/, "");
    const adminQueueUrl = adminQueueBase
      ? `${adminQueueBase}/listing-reports?tab=pending`
      : null;
    const businessPageUrl = buildBusinessClaimLink(business.slug);

    const { error: adminSendError } = await resendClient().emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: ADMIN_NEW_LISTING_REPORT_MESSAGE.subject(business.title),
      html: ADMIN_NEW_LISTING_REPORT_MESSAGE.html(business.title, {
        reason,
        details: payload.details,
        reporterName: payload.reporter_name,
        reporterEmail: trimmedEmail,
        suggestedPhone: payload.suggested_phone,
        suggestedEmail: payload.suggested_email,
        businessPageUrl,
        adminQueueUrl,
        listingPhone: business.phone ?? null,
        listingEmail: business.email ?? null,
      }),
    });

    if (adminSendError && process.env.NODE_ENV === "development") {
      console.error(
        "Failed to send listing report admin email:",
        adminSendError
      );
    }
  }

  return res.status(201).json(
    successHandler({
      listingReportId: data.listing_report_id,
      message: "Thanks! We received your report and will review it soon.",
    })
  );
};
