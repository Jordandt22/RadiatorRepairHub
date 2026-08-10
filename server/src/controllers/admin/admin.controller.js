import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import {
  getContactMessages as fetchContactMessages,
  updateContactMessagesStatus as updateMessagesStatus,
  updateContactMessagesArchived as updateMessagesArchived,
  deleteContactMessages as removeContactMessages,
  markContactMessagesConfirmed as markMessagesConfirmed,
  getContactMessagesByIds,
  markContactMessagesSent,
  getNearbyBusinessRecommendations,
  markContactMessagesDeclined as markMessagesDeclined,
  markContactMessagesResponded as markMessagesResponded,
  markContactMessagesNoResponse as markMessagesNoResponse,
  getClaimRequests as fetchClaimRequests,
  updateClaimRequestsStatus as updateClaimsStatus,
  deleteClaimRequests as removeClaimRequests,
  getListingReports as fetchListingReports,
  updateListingReportsStatus as updateReportsStatus,
  deleteListingReports as removeListingReports,
  getContactInquiries as fetchContactInquiries,
  updateContactInquiriesStatus as updateInquiriesStatus,
  deleteContactInquiries as removeContactInquiries,
  getFeedbackSurveys as fetchFeedbackSurveys,
  deleteFeedbackSurveys as removeFeedbackSurveys,
  getListingRequests as fetchListingRequests,
  updateListingRequestsStatus as updateListingRequestsStatusFn,
  deleteListingRequests as removeListingRequests,
  markListingRequestsLiveEmailSent,
  getBusinessExistsBySlug,
  getAdminBusinesses as fetchAdminBusinesses,
  getAdminBusinessById as fetchAdminBusinessById,
  getAdminBusinessesWithEmails as fetchAdminBusinessesWithEmails,
  clearBusinessEmails as clearEmailsOnBusinesses,
  updateBusinessesEmailStatus as patchBusinessesEmailStatus,
  updateBusinessEmail as patchBusinessEmail,
  updateBusinessListing as patchBusinessListing,
  unclaimBusinessesByIds,
  getAdminUsers as fetchAdminUsers,
  getAdminUserByUid as fetchAdminUserByUid,
  deleteAdminUsers as removeAdminUsers,
  getAdminLocationAggregates,
  filterAdminLocations,
  sortAdminLocations,
  buildAdminLocationChart,
  getAdminLocationDataIssues,
  filterAdminLocationDataIssues,
  getAdminDashboardStats,
  getOutreachBusinesses as fetchOutreachBusinesses,
  getOutreachMatchingBusinessIds,
  getOutreachBusinessesByIds,
  insertOutreachHistory,
  getOutreachHistory as fetchOutreachHistory,
  getOutreachHistoryMatchingIds as fetchOutreachHistoryMatchingIds,
  deleteOutreachHistoryByIds as removeOutreachHistory,
  getAffiliateProducts as fetchAffiliateProducts,
  createAffiliateProduct as insertAffiliateProduct,
  updateAffiliateProduct as patchAffiliateProduct,
  updateAffiliateProductsActive as patchAffiliateProductsActive,
} from "../../supabase/supabase.functions.js";
import {
  cacheData,
  getCacheData,
  getContactMessagesKey,
  getClaimRequestsKey,
  getListingReportsKey,
  getContactInquiriesKey,
  getFeedbackSurveysKey,
  getListingRequestsKey,
  getAdminBusinessesKey,
  getAdminLocationsKey,
  getAdminLocationAggregatesKey,
  getAdminDashboardStatsKey,
  getBusinessByIdKey,
  getBusinessBySlugKey,
  deleteCacheData,
  deleteCacheDataByPrefix,
  clearReferenceCache,
  flushDBCache,
} from "../../redis/redis.js";
import { clearClaimCodeCache } from "../../lib/claimHelpers.js";
import { buildFreeLeadEmailPayload } from "../../lib/contactMessageSend.js";
import {
  applyOutreachDevelopmentCap,
  buildOutreachEmailContent,
  isOutreachDevRedirect,
  resolveOutreachRecipientEmail,
} from "../../lib/outreachSend.js";
import {
  OutreachSendError,
  planOutreachBatch,
  sendOutreachBatch,
} from "../../outreach/sendOutreachBatch.js";
import {
  formatCitiesExportText,
  formatPostalCodesExportText,
  formatStatesExportText,
  locationSortLabel,
} from "../../lib/locationExport.js";
import { resendClient } from "../../resend/resend.js";
import {
  MESSAGE_ON_ITS_WAY,
  MESSAGE_DECLINED,
  MESSAGE_NO_RESPONSE,
  buildDeclinedRecommendationsHtml,
  buildNearbyRecommendationsHtml,
  DECLINED_RECOMMENDATIONS_FALLBACK,
  SENDER_NAME,
  LISTING_REQUEST_LIVE_MESSAGE,
  buildBusinessClaimLink,
} from "../../lib/constants/messages.js";
import {
  createIngestGroup as insertIngestGroup,
  deleteIngestGroups,
  getIngestBatchDetail,
  getIngestGroupDetail,
  listIngestGroups,
} from "../../ingest/db.js";
import { enqueueFilterJob } from "../../ingest/queues.js";
import {
  countPendingCdnBusinesses,
  deleteCdnUploadJobs,
  getCdnUploadBatchDetail,
  getCdnUploadJobDetail,
  hasActiveCdnUploadJob,
  listCdnUploadBusinesses,
  listCdnUploadJobs,
} from "../../cdn-upload/db.js";
import { startCdnUploadJob } from "../../cdn-upload/startJob.js";
import {
  countPendingEmailScrapeBusinesses,
  deleteEmailScrapeJobs,
  getEmailScrapeBatchDetail,
  getEmailScrapeJobDetail,
  hasActiveEmailScrapeJob,
  listEmailScrapeBusinesses,
  listEmailScrapeJobs,
} from "../../email-scrape/db.js";
import { startEmailScrapeJob } from "../../email-scrape/startJob.js";
import { normalizeWebsiteUrl } from "../../lib/websiteReachability.js";
import { getSystemsHealthChecks } from "../../lib/systemsHealth.js";
import {
  getOutreachSchedule,
  getOutreachSendJobDetail,
  listOutreachRuns,
  listRecentOutreachRuns,
  updateOutreachSchedule as saveOutreachSchedule,
} from "../../outreach-scheduler/db.js";
import {
  getOutreachSchedulerState,
  reconcileOutreachScheduler,
} from "../../outreach-scheduler/scheduler.js";
const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

export const loginAdmin = async (req, res) => {
  const { password } = req.body;
  const { ADMIN_PASSWORD, ADMIN_JWT_SECRET } = process.env;

  if (!ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Admin authentication is not configured."
        )
      );
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD);
  if (!isValid) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Invalid password"));
  }

  const secret = new TextEncoder().encode(ADMIN_JWT_SECRET);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return res.status(200).json(successHandler({ token }));
};

export const getContactMessages = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;
  const archived = req.query.archived === true || req.query.archived === "true";

  const { key, interval } = getContactMessagesKey(page, limit, status, archived);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchContactMessages(
    page,
    limit,
    status,
    archived
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    contactMessages: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
    archived,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const updateContactMessagesStatus = async (req, res) => {
  const { status, contact_message_ids } = req.body;

  const { data, error } = await updateMessagesStatus(
    contact_message_ids,
    status
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact message statuses.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
    })
  );
};

export const updateContactMessagesArchived = async (req, res) => {
  const { archived, contact_message_ids } = req.body;

  const { data, error } = await updateMessagesArchived(
    contact_message_ids,
    archived
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact message archive status.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      archived,
    })
  );
};

export const deleteContactMessages = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data, error } = await removeContactMessages(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting contact messages.",
          error
        )
      );
  }

  const contactMessageIds = (data ?? []).map((row) => row.contact_message_id);

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");

  return res.status(200).json(
    successHandler({
      deleted: contactMessageIds.length,
      contactMessageIds,
    })
  );
};

export const markContactMessagesConfirmed = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data: existing, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (existing ?? []).map((row) => [row.contact_message_id, row])
  );

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more contact messages could not be found."
          )
        );
    }

    if (message.confirmation_sent) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more selected messages are already confirmed."
          )
        );
    }
  }

  const { data, error } = await markMessagesConfirmed(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          error.message ||
            "There was an error marking contact messages as confirmed.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );
  const confirmationSentAt = data?.[0]?.confirmation_sent_at ?? null;

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      confirmation_sent: true,
      confirmation_sent_at: confirmationSentAt,
    })
  );
};

export const sendContactMessages = async (req, res) => {
  const { contact_message_ids } = req.body;
  const { SENDER_EMAIL, TEST_RECIPIENT_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email sending is not configured."
        )
      );
  }

  if (
    process.env.NODE_ENV === "development" &&
    !TEST_RECIPIENT_EMAIL
  ) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "TEST_RECIPIENT_EMAIL is required in development."
        )
      );
  }

  const { data: messages, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (messages ?? []).map((row) => [row.contact_message_id, row])
  );

  const skipped = [];
  const eligible = [];

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    if (message.status !== "approved") {
      skipped.push({ id, reason: "not_approved" });
      continue;
    }

    const businessEmail =
      typeof message.business?.email === "string"
        ? message.business.email.trim()
        : "";

    if (!businessEmail) {
      skipped.push({ id, reason: "missing_business_email" });
      continue;
    }

    eligible.push({ message, businessEmail });
  }

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        sent: [],
        skipped,
      })
    );
  }

  const batchPayload = eligible.map(({ message, businessEmail }) =>
    buildFreeLeadEmailPayload({
      message,
      businessEmail,
      senderEmail: SENDER_EMAIL,
    })
  );

  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload);

  if (batchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          batchError.message || "Failed to send emails.",
          batchError
        )
      );
  }

  const sentIds = eligible.map(({ message }) => message.contact_message_id);

  const { data: updated, error: updateError } =
    await markContactMessagesSent(sentIds);

  if (updateError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Emails were sent but status could not be updated.",
          updateError
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];

  return res.status(200).json(
    successHandler({
      sent: (updated ?? []).map((row) => row.contact_message_id),
      skipped,
      resendIds: resendResults.map((item) => item.id).filter(Boolean),
    })
  );
};

export const sendContactConfirmations = async (req, res) => {
  const { contact_message_ids } = req.body;
  const { SENDER_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email sending is not configured."
        )
      );
  }

  const { data: messages, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (messages ?? []).map((row) => [row.contact_message_id, row])
  );

  const skipped = [];
  const eligible = [];

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    if (message.status !== "sent") {
      skipped.push({ id, reason: "not_sent" });
      continue;
    }

    if (message.confirmation_sent) {
      skipped.push({ id, reason: "already_confirmed" });
      continue;
    }

    const contactEmail =
      typeof message.email === "string" ? message.email.trim() : "";

    if (!contactEmail) {
      skipped.push({ id, reason: "missing_contact_email" });
      continue;
    }

    eligible.push({ message, contactEmail });
  }

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        sent: [],
        skipped,
      })
    );
  }

  const batchPayload = eligible.map(({ message, contactEmail }) => ({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [contactEmail],
    subject: MESSAGE_ON_ITS_WAY.subject(message.business?.title),
    html: MESSAGE_ON_ITS_WAY.html(message.name, message.business?.title),
  }));

  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload);

  if (batchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          batchError.message || "Failed to send confirmation emails.",
          batchError
        )
      );
  }

  const sentIds = eligible.map(({ message }) => message.contact_message_id);

  const { data: updated, error: updateError } =
    await markMessagesConfirmed(sentIds);

  if (updateError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Emails were sent but confirmation status could not be updated.",
          updateError
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];

  return res.status(200).json(
    successHandler({
      sent: (updated ?? []).map((row) => row.contact_message_id),
      skipped,
      resendIds: resendResults.map((item) => item.id).filter(Boolean),
    })
  );
};

export const sendContactDeclined = async (req, res) => {
  const { contact_message_ids } = req.body;
  const { SENDER_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email sending is not configured."
        )
      );
  }

  const { data: messages, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (messages ?? []).map((row) => [row.contact_message_id, row])
  );

  const skipped = [];
  const eligible = [];

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    if (message.status === "declined") {
      skipped.push({ id, reason: "already_declined" });
      continue;
    }

    if (message.status !== "sent") {
      skipped.push({ id, reason: "not_sent" });
      continue;
    }

    if (!message.confirmation_sent) {
      skipped.push({ id, reason: "not_confirmed" });
      continue;
    }

    const contactEmail =
      typeof message.email === "string" ? message.email.trim() : "";

    if (!contactEmail) {
      skipped.push({ id, reason: "missing_contact_email" });
      continue;
    }

    eligible.push({ message, contactEmail });
  }

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        sent: [],
        skipped,
      })
    );
  }

  const batchPayload = [];

  for (const { message, contactEmail } of eligible) {
    const { data: recommendations, error: recommendationsError } =
      await getNearbyBusinessRecommendations({
        excludeBusinessId: message.business?.id ?? message.business_id,
        cityId: message.business?.city_id,
        postalCodeId: message.business?.postal_code_id,
        limit: 3,
      });

    if (recommendationsError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error fetching nearby business recommendations.",
            recommendationsError
          )
        );
    }

    const recommendationsHtml = buildDeclinedRecommendationsHtml(
      recommendations ?? []
    );

    batchPayload.push({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [contactEmail],
      subject: MESSAGE_DECLINED.subject(message.business?.title),
      html: MESSAGE_DECLINED.html(
        message.name,
        message.business?.title,
        recommendationsHtml
      ),
    });
  }

  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload);

  if (batchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          batchError.message || "Failed to send declined emails.",
          batchError
        )
      );
  }

  const sentIds = eligible.map(({ message }) => message.contact_message_id);

  const { data: updated, error: updateError } =
    await markMessagesDeclined(sentIds);

  if (updateError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Emails were sent but status could not be updated.",
          updateError
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];

  return res.status(200).json(
    successHandler({
      sent: (updated ?? []).map((row) => row.contact_message_id),
      skipped,
      resendIds: resendResults.map((item) => item.id).filter(Boolean),
    })
  );
};

export const sendContactNoResponse = async (req, res) => {
  const { contact_message_ids } = req.body;
  const { SENDER_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email sending is not configured."
        )
      );
  }

  const { data: messages, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (messages ?? []).map((row) => [row.contact_message_id, row])
  );

  const skipped = [];
  const eligible = [];

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    if (message.status === "no_response") {
      skipped.push({ id, reason: "already_no_response" });
      continue;
    }

    if (message.status !== "sent") {
      skipped.push({ id, reason: "not_sent" });
      continue;
    }

    if (!message.confirmation_sent) {
      skipped.push({ id, reason: "not_confirmed" });
      continue;
    }

    const contactEmail =
      typeof message.email === "string" ? message.email.trim() : "";

    if (!contactEmail) {
      skipped.push({ id, reason: "missing_contact_email" });
      continue;
    }

    eligible.push({ message, contactEmail });
  }

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        sent: [],
        skipped,
      })
    );
  }

  const batchPayload = [];

  for (const { message, contactEmail } of eligible) {
    const { data: recommendations, error: recommendationsError } =
      await getNearbyBusinessRecommendations({
        excludeBusinessId: message.business?.id ?? message.business_id,
        cityId: message.business?.city_id,
        postalCodeId: message.business?.postal_code_id,
        limit: 3,
      });

    if (recommendationsError) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error fetching nearby business recommendations.",
            recommendationsError
          )
        );
    }

    const recommendationsHtml = buildNearbyRecommendationsHtml(
      recommendations ?? [],
      DECLINED_RECOMMENDATIONS_FALLBACK
    );

    batchPayload.push({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [contactEmail],
      subject: MESSAGE_NO_RESPONSE.subject(message.business?.title),
      html: MESSAGE_NO_RESPONSE.html(
        message.name,
        message.business?.title,
        recommendationsHtml
      ),
    });
  }

  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload);

  if (batchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          batchError.message || "Failed to send no-response emails.",
          batchError
        )
      );
  }

  const sentIds = eligible.map(({ message }) => message.contact_message_id);

  const { data: updated, error: updateError } =
    await markMessagesNoResponse(sentIds);

  if (updateError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Emails were sent but status could not be updated.",
          updateError
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];

  return res.status(200).json(
    successHandler({
      sent: (updated ?? []).map((row) => row.contact_message_id),
      skipped,
      resendIds: resendResults.map((item) => item.id).filter(Boolean),
    })
  );
};

export const markContactMessagesDeclined = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data: existing, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (existing ?? []).map((row) => [row.contact_message_id, row])
  );

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more contact messages could not be found."
          )
        );
    }

    if (message.status === "declined") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more selected messages are already declined."
          )
        );
    }

    if (message.status !== "sent") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only sent messages can be marked as declined."
          )
        );
    }

    if (!message.confirmation_sent) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only confirmed messages can be marked as declined."
          )
        );
    }
  }

  const { data, error } = await markMessagesDeclined(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error marking contact messages as declined.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );
  const declinedAt = data?.[0]?.declined_at ?? null;

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      status: "declined",
      declined_at: declinedAt,
    })
  );
};

export const markContactMessagesResponded = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data: existing, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (existing ?? []).map((row) => [row.contact_message_id, row])
  );

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more contact messages could not be found."
          )
        );
    }

    if (message.status === "responded") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more selected messages are already marked as responded."
          )
        );
    }

    if (message.status !== "sent") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only sent messages can be marked as responded."
          )
        );
    }

    if (!message.confirmation_sent) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only confirmed messages can be marked as responded."
          )
        );
    }
  }

  const { data, error } = await markMessagesResponded(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error marking contact messages as responded.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );
  const respondedAt = data?.[0]?.responded_at ?? null;

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      status: "responded",
      responded_at: respondedAt,
    })
  );
};

export const markContactMessagesNoResponse = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data: existing, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (existing ?? []).map((row) => [row.contact_message_id, row])
  );

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more contact messages could not be found."
          )
        );
    }

    if (message.status === "no_response") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more selected messages are already marked as no response."
          )
        );
    }

    if (message.status !== "sent") {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only sent messages can be marked as no response."
          )
        );
    }

    if (!message.confirmation_sent) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "Only confirmed messages can be marked as no response."
          )
        );
    }
  }

  const { data, error } = await markMessagesNoResponse(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error marking contact messages as no response.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      status: "no_response",
    })
  );
};

export const getClaimRequests = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;

  const { key, interval } = getClaimRequestsKey(page, limit, status);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchClaimRequests(page, limit, status);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching claim requests.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    claimRequests: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const updateClaimRequestsStatus = async (req, res) => {
  const { status, claim_request_ids } = req.body;

  const { data, error } = await updateClaimsStatus(claim_request_ids, status);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating claim request statuses.",
          error
        )
      );
  }

  const claimRequestIds = (data ?? []).map((row) => row.claim_request_id);

  if (status === "expired") {
    await Promise.all(
      claimRequestIds.map((id) => clearClaimCodeCache(id))
    );
  }

  await deleteCacheDataByPrefix("CLAIM_REQUESTS");

  return res.status(200).json(
    successHandler({
      updated: claimRequestIds.length,
      claimRequestIds,
      status,
    })
  );
};

export const deleteClaimRequests = async (req, res) => {
  const { claim_request_ids } = req.body;

  const { data, error } = await removeClaimRequests(claim_request_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting claim requests.",
          error
        )
      );
  }

  const claimRequestIds = (data ?? []).map((row) => row.claim_request_id);

  await Promise.all(claimRequestIds.map((id) => clearClaimCodeCache(id)));
  await deleteCacheDataByPrefix("CLAIM_REQUESTS");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");

  return res.status(200).json(
    successHandler({
      deleted: claimRequestIds.length,
      claimRequestIds,
    })
  );
};

export const getListingReports = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;

  const { key, interval } = getListingReportsKey(page, limit, status);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchListingReports(page, limit, status);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching listing reports.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    listingReports: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const updateListingReportsStatus = async (req, res) => {
  const { status, listing_report_ids } = req.body;

  const { data, error } = await updateReportsStatus(
    listing_report_ids,
    status,
    "admin"
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating listing report statuses.",
          error
        )
      );
  }

  const listingReportIds = (data ?? []).map((row) => row.listing_report_id);

  await deleteCacheDataByPrefix("LISTING_REPORTS");

  return res.status(200).json(
    successHandler({
      updated: listingReportIds.length,
      listingReportIds,
      status,
    })
  );
};

export const deleteListingReports = async (req, res) => {
  const { listing_report_ids } = req.body;

  const { data, error } = await removeListingReports(listing_report_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting listing reports.",
          error
        )
      );
  }

  const listingReportIds = (data ?? []).map((row) => row.listing_report_id);

  await deleteCacheDataByPrefix("LISTING_REPORTS");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");

  return res.status(200).json(
    successHandler({
      deleted: listingReportIds.length,
      listingReportIds,
    })
  );
};

export const getContactInquiries = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;

  const { key, interval } = getContactInquiriesKey(page, limit, status);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchContactInquiries(
    page,
    limit,
    status
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact inquiries.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    contactInquiries: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const getFeedbackSurveys = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const formType = req.query.form_type || null;

  const { key, interval } = getFeedbackSurveysKey(page, limit, formType);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchFeedbackSurveys(
    page,
    limit,
    formType
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching feedback surveys.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    feedbackSurveys: data ?? [],
    total,
    totalPages,
    page,
    limit,
    form_type: formType,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const deleteFeedbackSurveys = async (req, res) => {
  const { feedback_survey_ids } = req.body;

  const { data, error } = await removeFeedbackSurveys(feedback_survey_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting feedback surveys.",
          error
        )
      );
  }

  const feedbackSurveyIds = (data ?? []).map((row) => row.feedback_survey_id);

  await deleteCacheDataByPrefix("FEEDBACK_SURVEYS");

  return res.status(200).json(
    successHandler({
      deleted: feedbackSurveyIds.length,
      feedbackSurveyIds,
    })
  );
};

export const updateContactInquiriesStatus = async (req, res) => {
  const { status, contact_inquiry_ids } = req.body;

  const { data, error } = await updateInquiriesStatus(
    contact_inquiry_ids,
    status,
    "admin"
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact inquiry statuses.",
          error
        )
      );
  }

  const contactInquiryIds = (data ?? []).map((row) => row.contact_inquiry_id);

  await deleteCacheDataByPrefix("CONTACT_INQUIRIES");

  return res.status(200).json(
    successHandler({
      updated: contactInquiryIds.length,
      contactInquiryIds,
      status,
    })
  );
};

export const deleteContactInquiries = async (req, res) => {
  const { contact_inquiry_ids } = req.body;

  const { data, error } = await removeContactInquiries(contact_inquiry_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting contact inquiries.",
          error
        )
      );
  }

  const contactInquiryIds = (data ?? []).map((row) => row.contact_inquiry_id);

  await deleteCacheDataByPrefix("CONTACT_INQUIRIES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");

  return res.status(200).json(
    successHandler({
      deleted: contactInquiryIds.length,
      contactInquiryIds,
    })
  );
};

export const getListingRequests = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;

  const { key, interval } = getListingRequestsKey(page, limit, status);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchListingRequests(page, limit, status);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching listing requests.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    listingRequests: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const updateListingRequestsStatus = async (req, res) => {
  const { status, listing_request_ids, business_slug } = req.body;

  let verifiedBusinessSlug = business_slug;

  if (status === "listed") {
    const { data: business, error: businessError } =
      await getBusinessExistsBySlug(business_slug);

    if (businessError) {
      if (businessError.code === "PGRST116") {
        return res
          .status(404)
          .json(
            customErrorHandler(
              YUP_ERROR,
              "No business found with that slug.",
              businessError
            )
          );
      }

      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error verifying the business slug.",
            businessError
          )
        );
    }

    verifiedBusinessSlug = business.slug;
  }

  const { data, error } = await updateListingRequestsStatusFn(
    listing_request_ids,
    status,
    "admin"
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating listing request statuses.",
          error
        )
      );
  }

  const listingRequestIds = (data ?? []).map((row) => row.listing_request_id);
  let liveEmailsSent = 0;

  if (status === "listed") {
    const toNotify = (data ?? []).filter(
      (row) =>
        !row.live_email_sent_at &&
        typeof row.email === "string" &&
        row.email.trim()
    );

    const { SENDER_EMAIL, RESEND_API_KEY } = process.env;
    const businessPageUrl = buildBusinessClaimLink(verifiedBusinessSlug);

    if (RESEND_API_KEY && SENDER_EMAIL && toNotify.length > 0) {
      const sentIds = [];

      for (const row of toNotify) {
        const { error: sendError } = await resendClient().emails.send({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [row.email.trim()],
          subject: LISTING_REQUEST_LIVE_MESSAGE.subject(row.business_name),
          html: LISTING_REQUEST_LIVE_MESSAGE.html(row.business_name, {
            businessPageUrl,
          }),
        });

        if (!sendError) {
          sentIds.push(row.listing_request_id);
        } else if (process.env.NODE_ENV === "development") {
          console.error(
            "Failed to send listing-live email:",
            sendError
          );
        }
      }

      if (sentIds.length > 0) {
        const { error: markError } =
          await markListingRequestsLiveEmailSent(sentIds);
        if (!markError) {
          liveEmailsSent = sentIds.length;
        } else if (process.env.NODE_ENV === "development") {
          console.error(
            "Listing-live emails sent but failed to mark live_email_sent_at:",
            markError
          );
        }
      }
    }
  }

  await deleteCacheDataByPrefix("LISTING_REQUESTS");

  return res.status(200).json(
    successHandler({
      updated: listingRequestIds.length,
      listingRequestIds,
      status,
      liveEmailsSent,
    })
  );
};

export const deleteListingRequests = async (req, res) => {
  const { listing_request_ids } = req.body;

  const { data, error } = await removeListingRequests(listing_request_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting listing requests.",
          error
        )
      );
  }

  const listingRequestIds = (data ?? []).map((row) => row.listing_request_id);

  await deleteCacheDataByPrefix("LISTING_REQUESTS");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");

  return res.status(200).json(
    successHandler({
      deleted: listingRequestIds.length,
      listingRequestIds,
    })
  );
};

export const getBusinesses = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const claimed =
    req.query.claimed === true || req.query.claimed === "true" ? true : null;
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;
  const stateCode =
    typeof req.query.state_code === "string" && req.query.state_code.trim()
      ? req.query.state_code.trim().toUpperCase()
      : null;
  const citySlug =
    typeof req.query.city_slug === "string" && req.query.city_slug.trim()
      ? req.query.city_slug.trim().toLowerCase()
      : null;
  const postalCode =
    typeof req.query.postal_code === "string" && req.query.postal_code.trim()
      ? req.query.postal_code.trim()
      : null;
  const scoreTier =
    typeof req.query.score_tier === "string" && req.query.score_tier.trim()
      ? req.query.score_tier.trim()
      : null;
  const reviewsTier =
    typeof req.query.reviews_tier === "string" &&
    req.query.reviews_tier.trim()
      ? req.query.reviews_tier.trim()
      : null;
  const emailFilter =
    typeof req.query.email_filter === "string" &&
    req.query.email_filter.trim()
      ? req.query.email_filter.trim()
      : null;

  const { key, interval } = getAdminBusinessesKey(
    page,
    limit,
    claimed,
    q,
    stateCode,
    citySlug,
    postalCode,
    scoreTier,
    reviewsTier,
    emailFilter
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, location, error } = await fetchAdminBusinesses(
    page,
    limit,
    {
      claimed,
      q,
      stateCode,
      citySlug,
      postalCode,
      scoreTier,
      reviewsTier,
      emailFilter,
    }
  );
  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            error.message || "Location not found.",
            error
          )
        );
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching businesses.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    businesses: data ?? [],
    location,
    total,
    totalPages,
    page,
    limit,
    claimed,
    q,
    state_code: stateCode,
    city_slug: citySlug,
    postal_code: postalCode,
    score_tier: scoreTier,
    reviews_tier: reviewsTier,
    email_filter: emailFilter,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const getBusinessById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await fetchAdminBusinessById(id);

  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "Business not found.", error)
        );
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the business.",
          error
        )
      );
  }

  return res.status(200).json(successHandler(data));
};

export const getBusinessesWithEmails = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;

  const parseBool = (value) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return null;
  };
  const emailsSent = parseBool(req.query.emails_sent);
  const suspicious = parseBool(req.query.suspicious);
  const emailStatus =
    typeof req.query.email_status === "string" && req.query.email_status.trim()
      ? req.query.email_status.trim()
      : null;
  const requireEmail = parseBool(req.query.require_email);
  const requireEmailValue = requireEmail === null ? true : requireEmail;
  const hasEmail = parseBool(req.query.has_email);

  const { data, count, error } = await fetchAdminBusinessesWithEmails(
    page,
    limit,
    {
      q,
      emailsSent,
      suspicious: requireEmailValue ? suspicious : null,
      emailStatus,
      requireEmail: requireEmailValue,
      hasEmail: requireEmailValue ? null : hasEmail,
    }
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching businesses with emails.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  return res.status(200).json(
    successHandler({
      businesses: data ?? [],
      total,
      totalPages,
      page,
      limit,
      q,
      emails_sent: emailsSent,
      suspicious: requireEmailValue ? suspicious : null,
      require_email: requireEmailValue,
      has_email: requireEmailValue ? null : hasEmail,
    })
  );
};

export const clearBusinessEmails = async (req, res) => {
  const { business_ids } = req.body;

  const { data, error } = await clearEmailsOnBusinesses(business_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error clearing business emails.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("ADMIN_BUSINESSES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");
  await deleteCacheDataByPrefix("ADMIN_LOCATIONS");

  const clearedIds = (data ?? []).map((row) => row.id);

  return res.status(200).json(
    successHandler({
      cleared: clearedIds.length,
      business_ids: clearedIds,
    })
  );
};

export const markBusinessEmailStatus = async (req, res) => {
  const { business_ids, email_status } = req.body;

  const { data, error } = await patchBusinessesEmailStatus(
    business_ids,
    email_status
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating email status.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("ADMIN_BUSINESSES");

  const markedIds = (data ?? []).map((row) => row.id);

  return res.status(200).json(
    successHandler({
      marked: markedIds.length,
      business_ids: markedIds,
      email_status,
      email_status_marked_at: data?.[0]?.email_status_marked_at ?? null,
    })
  );
};

export const updateBusinessEmail = async (req, res) => {
  const { business_id, email } = req.body;
  const normalizedEmail = String(email).trim();

  const { data, error } = await patchBusinessEmail(
    business_id,
    normalizedEmail
  );

  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "Business not found.", error)
        );
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating the business email.",
          error
        )
      );
  }

  try {
    const { key: businessIdCacheKey } = getBusinessByIdKey(data.id);
    await deleteCacheData(businessIdCacheKey);
    if (data.slug) {
      const { key: businessSlugCacheKey } = getBusinessBySlugKey(data.slug);
      await deleteCacheData(businessSlugCacheKey);
    }
  } catch {
    // best-effort cache cleanup
  }

  await deleteCacheDataByPrefix("ADMIN_BUSINESSES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");
  await deleteCacheDataByPrefix("ADMIN_LOCATIONS");

  return res.status(200).json(
    successHandler({
      id: data.id,
      title: data.title,
      slug: data.slug,
      email: data.email,
    })
  );
};

export const updateBusinessListing = async (req, res) => {
  const {
    business_id,
    title,
    email,
    website,
    phone,
    address,
    description,
    title_tag,
    meta_description,
    local_note,
    keywords,
  } = req.body;

  const normalizedTitle = String(title ?? "").trim();
  const normalizedAddress = String(address ?? "").trim();
  const normalizedPhone = String(phone ?? "").trim();
  const normalizedEmail =
    typeof email === "string" && email.trim() ? email.trim() : null;
  const normalizedWebsite =
    typeof website === "string" && website.trim()
      ? normalizeWebsiteUrl(website.trim())
      : null;
  const normalizedDescription = String(description ?? "").trim();
  const normalizedTitleTag = String(title_tag ?? "").trim();
  const normalizedMetaDescription = String(meta_description ?? "").trim();
  const normalizedLocalNote = String(local_note ?? "").trim();
  const normalizedKeywords = Array.isArray(keywords)
    ? keywords
        .map((keyword) => String(keyword ?? "").trim())
        .filter(Boolean)
    : [];

  const { data, error } = await patchBusinessListing(business_id, {
    title: normalizedTitle,
    email: normalizedEmail,
    website: normalizedWebsite,
    phone: normalizedPhone,
    address: normalizedAddress,
    description: normalizedDescription,
    title_tag: normalizedTitleTag,
    meta_description: normalizedMetaDescription,
    local_note: normalizedLocalNote,
    keywords: normalizedKeywords,
  });

  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "Business not found.", error)
        );
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating the business listing.",
          error
        )
      );
  }

  try {
    const { key: businessIdCacheKey } = getBusinessByIdKey(data.id);
    await deleteCacheData(businessIdCacheKey);
    if (data.slug) {
      const { key: businessSlugCacheKey } = getBusinessBySlugKey(data.slug);
      await deleteCacheData(businessSlugCacheKey);
    }
  } catch {
    // best-effort cache cleanup
  }

  await deleteCacheDataByPrefix("ADMIN_BUSINESSES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");
  await deleteCacheDataByPrefix("ADMIN_LOCATIONS");

  return res.status(200).json(
    successHandler({
      id: data.id,
      title: data.title,
      slug: data.slug,
      email: data.email,
      website: data.website,
      phone: data.phone,
      address: data.address,
      description: data.description,
      title_tag: data.title_tag,
      meta_description: data.meta_description,
      local_note: data.local_note,
      keywords: data.keywords,
      last_edited_at: data.last_edited_at,
    })
  );
};

export const unclaimBusinesses = async (req, res) => {
  const { business_ids } = req.body;

  const { data, error } = await unclaimBusinessesByIds(business_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error reversing business claims.",
          error
        )
      );
  }

  for (const business of data ?? []) {
    try {
      const { key: businessIdCacheKey } = getBusinessByIdKey(business.id);
      await deleteCacheData(businessIdCacheKey);
      if (business.slug) {
        const { key: businessSlugCacheKey } = getBusinessBySlugKey(
          business.slug
        );
        await deleteCacheData(businessSlugCacheKey);
      }
    } catch {
      // best-effort cache cleanup
    }
  }

  await deleteCacheDataByPrefix("ADMIN_BUSINESSES");
  await deleteCacheDataByPrefix("ADMIN_DASHBOARD");
  await deleteCacheDataByPrefix("ADMIN_LOCATIONS");

  const unclaimedIds = (data ?? []).map((row) => row.id);

  return res.status(200).json(
    successHandler({
      unclaimed: unclaimedIds.length,
      business_ids: unclaimedIds,
    })
  );
};

export const getUsers = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;

  const { data, count, error } = await fetchAdminUsers(page, limit, { q });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching users.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  return res.status(200).json(
    successHandler({
      users: data ?? [],
      total,
      totalPages,
      page,
      limit,
      q,
    })
  );
};

export const getUserByUid = async (req, res) => {
  const { uid } = req.params;

  const { data, error } = await fetchAdminUserByUid(uid);

  if (error) {
    if (error.code === "PGRST116") {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "User not found.", error)
        );
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the user.",
          error
        )
      );
  }

  return res.status(200).json(successHandler(data));
};

export const deleteUsers = async (req, res) => {
  const { user_ids } = req.body;

  const { deleted, unclaimedBusinesses, errors } =
    await removeAdminUsers(user_ids);

  for (const business of unclaimedBusinesses ?? []) {
    try {
      const { key: businessIdCacheKey } = getBusinessByIdKey(business.id);
      await deleteCacheData(businessIdCacheKey);
      if (business.slug) {
        const { key: businessSlugCacheKey } = getBusinessBySlugKey(
          business.slug
        );
        await deleteCacheData(businessSlugCacheKey);
      }
    } catch {
      // best-effort cache cleanup
    }
  }

  if (deleted.length || unclaimedBusinesses.length) {
    await deleteCacheDataByPrefix("ADMIN_BUSINESSES");
    await deleteCacheDataByPrefix("ADMIN_DASHBOARD");
    await deleteCacheDataByPrefix("ADMIN_LOCATIONS");
  }

  if (deleted.length === 0 && errors.length > 0) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          errors[0]?.message || "There was an error deleting users.",
          errors
        )
      );
  }

  return res.status(200).json(
    successHandler({
      deleted: deleted.length,
      user_ids: deleted,
      errors,
    })
  );
};

export const getLocations = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const tab = req.query.tab;
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;
  const stateId =
    typeof req.query.state_id === "string" && req.query.state_id.trim()
      ? req.query.state_id.trim()
      : null;
  const cityId =
    typeof req.query.city_id === "string" && req.query.city_id.trim()
      ? req.query.city_id.trim()
      : null;
  const sort =
    typeof req.query.sort === "string" && req.query.sort.trim()
      ? req.query.sort.trim()
      : "businesses_desc";

  const { key, interval } = getAdminLocationsKey(
    tab,
    page,
    limit,
    q,
    stateId,
    cityId,
    sort
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  if (tab === "data-issues") {
    const aggregatesCache = getAdminLocationAggregatesKey(tab);
    let issues = null;
    const cachedIssues = await getCacheData(aggregatesCache.key);
    if (cachedIssues?.data) {
      issues = cachedIssues.data;
    } else {
      const { data, error } = await getAdminLocationDataIssues();
      if (error) {
        return res
          .status(500)
          .json(
            customErrorHandler(
              SUPABASE_ERROR,
              "There was an error fetching location data issues.",
              error
            )
          );
      }
      issues = data ?? [];
      await cacheData(aggregatesCache.key, aggregatesCache.interval, issues);
    }

    const filtered = filterAdminLocationDataIssues(issues, q);
    const total = filtered.length;
    let totalPages = Math.ceil(total / limit) || 0;
    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    const start = (page - 1) * limit;
    const locations = filtered.slice(start, start + limit);

    const compiledData = {
      locations,
      chart: null,
      total,
      totalPages,
      page,
      limit,
      tab,
      q,
      state_id: null,
      city_id: null,
      sort: null,
    };

    await cacheData(key, interval, compiledData);
    return res.status(200).json(successHandler(compiledData));
  }

  const aggregatesCache = getAdminLocationAggregatesKey(tab);
  let aggregates = null;
  const cachedAggregates = await getCacheData(aggregatesCache.key);
  if (cachedAggregates?.data) {
    aggregates = cachedAggregates.data;
  } else {
    const { data, error } = await getAdminLocationAggregates(tab);
    if (error) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error fetching location stats.",
            error
          )
        );
    }
    aggregates = data ?? [];
    await cacheData(aggregatesCache.key, aggregatesCache.interval, aggregates);
  }

  const filtered = filterAdminLocations(aggregates, tab, q, {
    stateId,
    cityId,
  });
  const sorted = sortAdminLocations(filtered, tab, sort);
  const total = sorted.length;
  let totalPages = Math.ceil(total / limit) || 0;
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const start = (page - 1) * limit;
  const locations = sorted.slice(start, start + limit);
  const chart = buildAdminLocationChart(filtered, tab);

  const compiledData = {
    locations,
    chart,
    total,
    totalPages,
    page,
    limit,
    tab,
    q,
    state_id: stateId,
    city_id: cityId,
    sort,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

async function loadAdminLocationAggregates(tab) {
  const aggregatesCache = getAdminLocationAggregatesKey(tab);
  const cachedAggregates = await getCacheData(aggregatesCache.key);
  if (cachedAggregates?.data) {
    return { data: cachedAggregates.data, error: null };
  }

  const { data, error } = await getAdminLocationAggregates(tab);
  if (error) {
    return { data: null, error };
  }

  const aggregates = data ?? [];
  await cacheData(aggregatesCache.key, aggregatesCache.interval, aggregates);
  return { data: aggregates, error: null };
}

export const exportLocationStates = async (req, res) => {
  const sort =
    typeof req.query.sort === "string" && req.query.sort.trim()
      ? req.query.sort.trim()
      : "businesses_desc";

  const { data: aggregates, error } = await loadAdminLocationAggregates("states");
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error exporting state location stats.",
          error
        )
      );
  }

  const sorted = sortAdminLocations(aggregates ?? [], "states", sort);
  const text = formatStatesExportText(sorted, { sort });

  return res.status(200).json(
    successHandler({
      tab: "states",
      sort,
      sort_label: locationSortLabel(sort),
      total: sorted.length,
      text,
    })
  );
};

export const exportLocationCities = async (req, res) => {
  const stateId = req.query.state_id;
  const sort =
    typeof req.query.sort === "string" && req.query.sort.trim()
      ? req.query.sort.trim()
      : "businesses_desc";

  const [
    { data: stateAggregates, error: statesError },
    { data: cityAggregates, error: citiesError },
  ] = await Promise.all([
    loadAdminLocationAggregates("states"),
    loadAdminLocationAggregates("cities"),
  ]);

  if (statesError || citiesError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error exporting city location stats.",
          statesError || citiesError
        )
      );
  }

  const state = (stateAggregates ?? []).find((row) => row.id === stateId);
  if (!state) {
    return res
      .status(404)
      .json(customErrorHandler(YUP_ERROR, "State not found."));
  }

  const filtered = filterAdminLocations(cityAggregates ?? [], "cities", null, {
    stateId,
  });
  const sorted = sortAdminLocations(filtered, "cities", sort);
  const text = formatCitiesExportText(sorted, {
    sort,
    stateName: state.name,
    stateCode: state.code,
    stateBusinessCount: state.business_count,
  });

  return res.status(200).json(
    successHandler({
      tab: "cities",
      sort,
      sort_label: locationSortLabel(sort),
      total: sorted.length,
      state: {
        id: state.id,
        name: state.name,
        code: state.code,
        business_count: state.business_count,
      },
      text,
    })
  );
};

export const exportLocationPostalCodes = async (req, res) => {
  const cityId = req.query.city_id;
  const sort =
    typeof req.query.sort === "string" && req.query.sort.trim()
      ? req.query.sort.trim()
      : "businesses_desc";

  const [
    { data: cityAggregates, error: citiesError },
    { data: postalAggregates, error: postalError },
  ] = await Promise.all([
    loadAdminLocationAggregates("cities"),
    loadAdminLocationAggregates("postal-codes"),
  ]);

  if (citiesError || postalError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error exporting postal code location stats.",
          citiesError || postalError
        )
      );
  }

  const city = (cityAggregates ?? []).find((row) => row.id === cityId);
  if (!city) {
    return res
      .status(404)
      .json(customErrorHandler(YUP_ERROR, "City not found."));
  }

  const filtered = filterAdminLocations(
    postalAggregates ?? [],
    "postal-codes",
    null,
    { cityId }
  );
  const sorted = sortAdminLocations(filtered, "postal-codes", sort);
  const text = formatPostalCodesExportText(sorted, {
    sort,
    cityName: city.name,
    stateName: city.state_name,
    stateCode: city.state_code,
    cityBusinessCount: city.business_count,
  });

  return res.status(200).json(
    successHandler({
      tab: "postal-codes",
      sort,
      sort_label: locationSortLabel(sort),
      total: sorted.length,
      city: {
        id: city.id,
        name: city.name,
        state_id: city.state_id,
        state_name: city.state_name,
        state_code: city.state_code,
        business_count: city.business_count,
      },
      text,
    })
  );
};

export const getDashboardStats = async (req, res) => {
  const { key, interval } = getAdminDashboardStatsKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getAdminDashboardStats();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching dashboard stats.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  return res.status(200).json(successHandler(data));
};

const CACHE_RESOURCE_PREFIXES = {
  "contact-messages": "CONTACT_MESSAGES",
  "contact-inquiries": "CONTACT_INQUIRIES",
  "feedback-surveys": "FEEDBACK_SURVEYS",
  "claim-requests": "CLAIM_REQUESTS",
  "listing-reports": "LISTING_REPORTS",
  "listing-requests": "LISTING_REQUESTS",
  businesses: "ADMIN_BUSINESSES",
  locations: "ADMIN_LOCATIONS",
  dashboard: "ADMIN_DASHBOARD",
};

export const invalidateCache = async (req, res) => {
  const { resource } = req.body;

  if (resource === "all") {
    await flushDBCache();
    return res.status(200).json(
      successHandler({
        resource,
        invalidated: true,
      })
    );
  }

  if (resource === "reference") {
    await clearReferenceCache();
    return res.status(200).json(
      successHandler({
        resource,
        invalidated: true,
      })
    );
  }

  const prefix = CACHE_RESOURCE_PREFIXES[resource];

  if (!prefix) {
    return res
      .status(400)
      .json(customErrorHandler(YUP_ERROR, "Invalid cache resource"));
  }

  await deleteCacheDataByPrefix(prefix);

  return res.status(200).json(
    successHandler({
      resource,
      invalidated: true,
    })
  );
};

export const getSystemsHealth = async (_req, res) => {
  const data = await getSystemsHealthChecks();
  return res.status(200).json(successHandler(data));
};

const parseOutreachListFilters = (source = {}) => {
  const rawQ = typeof source.q === "string" ? source.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;
  const claimEligibility =
    typeof source.claim_eligibility === "string" &&
    source.claim_eligibility.trim()
      ? source.claim_eligibility.trim()
      : null;
  const websiteFilter =
    typeof source.website_filter === "string" && source.website_filter.trim()
      ? source.website_filter.trim()
      : null;

  const parseBool = (value) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return null;
  };

  return {
    q,
    claimEligibility,
    websiteFilter,
    claimInviteSent: parseBool(source.claim_invite_sent),
    websiteOfferSent: parseBool(source.website_offer_sent),
    claimFollowupSent: parseBool(source.claim_followup_sent),
  };
};

export const getOutreachBusinesses = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const filters = parseOutreachListFilters(req.query);

  const { data, count, error } = await fetchOutreachBusinesses(
    page,
    limit,
    filters
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching outreach businesses.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  return res.status(200).json(
    successHandler({
      businesses: data ?? [],
      total,
      totalPages,
      page,
      limit,
      q: filters.q,
      claim_eligibility: filters.claimEligibility,
      website_filter: filters.websiteFilter,
      claim_invite_sent: filters.claimInviteSent,
      website_offer_sent: filters.websiteOfferSent,
      claim_followup_sent: filters.claimFollowupSent,
    })
  );
};

export const getOutreachMatchingIds = async (req, res) => {
  const {
    outreach_type,
    limit = 25,
    q,
    claim_eligibility,
    website_filter,
    claim_invite_sent,
    website_offer_sent,
    claim_followup_sent,
  } = req.body;

  const filters = parseOutreachListFilters({
    q,
    claim_eligibility,
    website_filter,
    claim_invite_sent,
    website_offer_sent,
    claim_followup_sent,
  });

  const { data, businesses, error } = await getOutreachMatchingBusinessIds({
    outreachType: outreach_type,
    limit,
    ...filters,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error resolving matching businesses.",
          error
        )
      );
  }

  return res.status(200).json(
    successHandler({
      business_ids: data ?? [],
      businesses: businesses ?? [],
      outreach_type,
      limit,
    })
  );
};

export const previewOutreachEmails = async (req, res) => {
  const { business_ids, outreach_type } = req.body;

  const { data: businesses, error } =
    await getOutreachBusinessesByIds(business_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching businesses for preview.",
          error
        )
      );
  }

  const { skipped, eligible } = applyOutreachDevelopmentCap(
    planOutreachBatch(business_ids, businesses, outreach_type)
  );

  const sample = eligible[0] ?? null;
  const sampleContent = sample
    ? buildOutreachEmailContent(sample.business, outreach_type)
    : null;
  const devRedirect = isOutreachDevRedirect();
  const deliveryEmail = devRedirect
    ? process.env.TEST_RECIPIENT_EMAIL
    : null;

  return res.status(200).json(
    successHandler({
      outreach_type,
      dev_redirect: devRedirect,
      delivery_email: deliveryEmail,
      will_send: eligible.map(({ business, recipient }) => ({
        id: business.id,
        title: business.title ?? null,
        recipient,
        delivery_to: resolveOutreachRecipientEmail(recipient),
        claim_eligibility: business.claim_eligibility,
      })),
      skipped,
      sample: sampleContent
        ? {
            business_id: sample.business.id,
            business_title: sample.business.title ?? null,
            recipient: sample.recipient,
            delivery_to: resolveOutreachRecipientEmail(sample.recipient),
            subject: sampleContent.subject,
            html: sampleContent.html,
          }
        : null,
    })
  );
};

export const sendOutreachEmails = async (req, res) => {
  const { business_ids, outreach_type } = req.body;
  try {
    const result = await sendOutreachBatch({
      businessIds: business_ids,
      outreachType: outreach_type,
    });
    return res.status(200).json(successHandler(result));
  } catch (error) {
    if (!(error instanceof OutreachSendError)) throw error;
    const errorCode = [
      "business_fetch_failed",
      "history_insert_failed",
    ].includes(error.code)
      ? SUPABASE_ERROR
      : SERVER_ERROR;
    return res
      .status(500)
      .json(customErrorHandler(errorCode, error.message, error.details));
  }
};

async function buildOutreachSchedulerResponse(scheduleOverride = null) {
  const scheduleWithCampaigns =
    scheduleOverride ?? (await getOutreachSchedule());
  const {
    outreach_schedule_campaigns: campaigns = [],
    ...schedule
  } = scheduleWithCampaigns;
  const [bullmqState, recentRuns] = await Promise.all([
    getOutreachSchedulerState(),
    listRecentOutreachRuns(10),
  ]);
  return {
    schedule,
    campaigns,
    next_run_at: bullmqState?.next ?? null,
    bullmq_state: bullmqState,
    recent_runs: recentRuns,
  };
}

export const getOutreachScheduler = async (_req, res) => {
  try {
    return res
      .status(200)
      .json(successHandler(await buildOutreachSchedulerResponse()));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Unable to load the outreach scheduler.",
          error
        )
      );
  }
};

export const updateOutreachScheduler = async (req, res) => {
  const { enabled, local_time, timezone, campaigns } = req.body;
  let schedule;
  try {
    schedule = await saveOutreachSchedule({
      enabled,
      localTime: local_time,
      timezone,
      campaigns,
    });
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to save outreach scheduler settings.",
          error
        )
      );
  }

  try {
    await reconcileOutreachScheduler(schedule);
    return res
      .status(200)
      .json(successHandler(await buildOutreachSchedulerResponse(schedule)));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Scheduler settings were saved, but scheduler reconciliation failed.",
          error
        )
      );
  }
};

export const getOutreachSchedulerRuns = async (req, res) => {
  try {
    const result = await listOutreachRuns(req.query.page, req.query.limit);
    return res.status(200).json(successHandler(result));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to load outreach scheduler runs.",
          error
        )
      );
  }
};

export const getOutreachSchedulerJob = async (req, res) => {
  try {
    const detail = await getOutreachSendJobDetail(req.params.jobId);
    if (!detail) {
      return res
        .status(404)
        .json(
          customErrorHandler(
            SERVER_ERROR,
            "Scheduled outreach job not found."
          )
        );
    }
    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to load the scheduled outreach job.",
          error
        )
      );
  }
};

/** Record outreach as sent without delivering email (manual / external send). */
export const markOutreachEmailsSent = async (req, res) => {
  const { business_ids, outreach_type } = req.body;

  const { data: businesses, error: fetchError } =
    await getOutreachBusinessesByIds(business_ids);

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching businesses.",
          fetchError
        )
      );
  }

  const { skipped, eligible } = planOutreachBatch(
    business_ids,
    businesses,
    outreach_type
  );

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        marked: [],
        skipped,
      })
    );
  }

  const sentAt = new Date().toISOString();
  const historyRows = eligible.map(({ business, recipient }) => {
    const content = buildOutreachEmailContent(business, outreach_type);
    return {
      business_id: business.id,
      message_type: "email",
      outreach_type,
      recipient,
      subject: content?.subject ?? null,
      provider: "manual",
      provider_message_id: null,
      sent_at: sentAt,
      sent_by: null,
      metadata: {
        marked_sent: true,
        no_email: true,
      },
    };
  });

  const { data: inserted, error: insertError } =
    await insertOutreachHistory(historyRows);

  if (insertError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error saving outreach history.",
          insertError
        )
      );
  }

  const markedIds = (inserted ?? []).map((row) => row.business_id);

  return res.status(200).json(
    successHandler({
      marked: markedIds,
      skipped,
    })
  );
};

export const getOutreachHistoryList = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const outreachType =
    typeof req.query.outreach_type === "string" &&
    req.query.outreach_type.trim()
      ? req.query.outreach_type.trim()
      : null;
  const q =
    typeof req.query.q === "string" && req.query.q.trim()
      ? req.query.q.trim()
      : null;
  const emailChangedOrMissing =
    req.query.email_changed_or_missing === true ||
    req.query.email_changed_or_missing === "true"
      ? true
      : req.query.email_changed_or_missing === false ||
          req.query.email_changed_or_missing === "false"
        ? false
        : null;

  const { data, count, error } = await fetchOutreachHistory(page, limit, {
    outreachType,
    q,
    emailChangedOrMissing,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching outreach history.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  return res.status(200).json(
    successHandler({
      history: data ?? [],
      total,
      totalPages,
      page,
      limit,
      outreach_type: outreachType,
      q,
      email_changed_or_missing: emailChangedOrMissing,
    })
  );
};

export const getOutreachHistoryMatchingIdsList = async (req, res) => {
  const outreachType =
    typeof req.body.outreach_type === "string" && req.body.outreach_type.trim()
      ? req.body.outreach_type.trim()
      : null;
  const q =
    typeof req.body.q === "string" && req.body.q.trim()
      ? req.body.q.trim()
      : null;
  const emailChangedOrMissing =
    req.body.email_changed_or_missing === true
      ? true
      : req.body.email_changed_or_missing === false
        ? false
        : null;
  const limit = Number(req.body.limit) || 100;

  const { data, error } = await fetchOutreachHistoryMatchingIds({
    outreachType,
    q,
    emailChangedOrMissing,
    limit,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching matching outreach history.",
          error
        )
      );
  }

  return res.status(200).json(
    successHandler({
      outreach_history_ids: data ?? [],
      count: (data ?? []).length,
      limit,
      outreach_type: outreachType,
      q,
      email_changed_or_missing: emailChangedOrMissing,
    })
  );
};

export const deleteOutreachHistory = async (req, res) => {
  const { outreach_history_ids } = req.body;

  const { data, error } = await removeOutreachHistory(outreach_history_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error removing outreach history.",
          error
        )
      );
  }

  const deletedIds = (data ?? []).map((row) => row.outreach_history_id);

  return res.status(200).json(
    successHandler({
      deleted: deletedIds.length,
      outreach_history_ids: deletedIds,
    })
  );
};

export const getAffiliateProducts = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const { data, count, error } = await fetchAffiliateProducts(page, limit);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching affiliate products.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  return res.status(200).json(
    successHandler({
      products: data ?? [],
      total,
      totalPages,
      page,
      limit,
    })
  );
};

export const createAffiliateProduct = async (req, res) => {
  const {
    provider,
    title,
    description,
    image_url,
    product_link,
    affiliate_link,
  } = req.body;

  const { data, error } = await insertAffiliateProduct({
    provider,
    title,
    description: description ?? null,
    image_url: image_url ?? null,
    product_link,
    affiliate_link,
  });

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error creating the affiliate product.",
          error
        )
      );
  }

  return res.status(201).json(successHandler({ product: data }));
};

export const updateAffiliateProduct = async (req, res) => {
  const {
    id,
    provider,
    title,
    description,
    image_url,
    product_link,
    affiliate_link,
  } = req.body;

  const { data, error } = await patchAffiliateProduct(id, {
    provider,
    title,
    description: description ?? null,
    image_url: image_url ?? null,
    product_link,
    affiliate_link,
  });

  if (error) {
    const notFound =
      error.code === "PGRST116" ||
      error.message?.toLowerCase().includes("no rows");

    return res
      .status(notFound ? 404 : 500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          notFound
            ? "Affiliate product not found."
            : "There was an error updating the affiliate product.",
          error
        )
      );
  }

  return res.status(200).json(successHandler({ product: data }));
};

export const updateAffiliateProductsActive = async (req, res) => {
  const { affiliate_product_ids, is_active } = req.body;

  const { data, error } = await patchAffiliateProductsActive(
    affiliate_product_ids,
    is_active
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating affiliate product status.",
          error
        )
      );
  }

  return res.status(200).json(
    successHandler({
      updated: data?.length ?? 0,
      ids: (data ?? []).map((row) => row.id),
    })
  );
};

export const createIngestGroup = async (req, res) => {
  const file = req.file;
  if (!file?.buffer) {
    return res
      .status(400)
      .json(
        customErrorHandler(YUP_ERROR, "A JSON file is required (field: file).")
      );
  }

  let payload;
  try {
    payload = JSON.parse(file.buffer.toString("utf-8"));
  } catch {
    return res
      .status(400)
      .json(customErrorHandler(YUP_ERROR, "File must contain valid JSON."));
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    return res
      .status(400)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "JSON must be a non-empty array of businesses."
        )
      );
  }

  const originalName = file.originalname || "upload.json";
  const nameFromBody =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const name =
    nameFromBody ||
    originalName.replace(/\.json$/i, "") ||
    `ingest-${new Date().toISOString()}`;

  try {
    const group = await insertIngestGroup({ name, payload });
    await enqueueFilterJob(group.id);

    return res.status(201).json(successHandler({ group }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error creating the ingest group.",
          error
        )
      );
  }
};

export const getIngestGroups = async (req, res) => {
  try {
    const groups = await listIngestGroups();
    return res.status(200).json(successHandler({ groups }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching ingest groups.",
          error
        )
      );
  }
};

export const getIngestGroupById = async (req, res) => {
  const { groupId } = req.params;

  try {
    const detail = await getIngestGroupDetail(groupId);

    if (!detail) {
      return res
        .status(404)
        .json(customErrorHandler(SUPABASE_ERROR, "Ingest group not found."));
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the ingest group.",
          error
        )
      );
  }
};

export const deleteIngestGroupsHandler = async (req, res) => {
  const { group_ids } = req.body;

  try {
    const data = await deleteIngestGroups(group_ids);
    return res.status(200).json(
      successHandler({
        deleted: data?.length ?? 0,
        ids: (data ?? []).map((row) => row.id),
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting ingest groups.",
          error
        )
      );
  }
};

export const getIngestBatchById = async (req, res) => {
  const { batchId } = req.params;

  try {
    const detail = await getIngestBatchDetail(batchId);

    if (!detail) {
      return res
        .status(404)
        .json(customErrorHandler(SUPABASE_ERROR, "Ingest batch not found."));
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the ingest batch.",
          error
        )
      );
  }
};

export const getCdnUploadPendingCount = async (req, res) => {
  try {
    const pending_count = await countPendingCdnBusinesses();
    return res.status(200).json(successHandler({ pending_count }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the pending CDN upload count.",
          error
        )
      );
  }
};

export const getCdnUploadBusinesses = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;

  const parseBool = (value) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return null;
  };
  const cdnStored = parseBool(req.query.cdn_stored);
  const hasAttempts = parseBool(req.query.has_attempts);

  try {
    const result = await listCdnUploadBusinesses(page, limit, {
      q,
      cdnStored,
      hasAttempts,
    });

    const total = result.count ?? 0;
    let totalPages = Math.ceil(total / result.limit) || 0;
    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    return res.status(200).json(
      successHandler({
        businesses: result.businesses,
        pagination: {
          page: result.page,
          limit: result.limit,
          total,
          totalPages,
        },
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching CDN upload businesses.",
          error
        )
      );
  }
};

export const getCdnUploadJobs = async (req, res) => {
  try {
    const jobs = await listCdnUploadJobs();
    return res.status(200).json(successHandler({ jobs }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching CDN upload jobs.",
          error
        )
      );
  }
};

export const getCdnUploadJobById = async (req, res) => {
  const { jobId } = req.params;

  try {
    const detail = await getCdnUploadJobDetail(jobId);

    if (!detail) {
      return res
        .status(404)
        .json(customErrorHandler(SUPABASE_ERROR, "CDN upload job not found."));
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the CDN upload job.",
          error
        )
      );
  }
};

export const getCdnUploadBatchById = async (req, res) => {
  const { batchId } = req.params;

  try {
    const detail = await getCdnUploadBatchDetail(batchId);

    if (!detail) {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "CDN upload batch not found.")
        );
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the CDN upload batch.",
          error
        )
      );
  }
};

export const createCdnUploadJobHandler = async (req, res) => {
  const limit =
    typeof req.body?.limit === "number" && Number.isFinite(req.body.limit)
      ? req.body.limit
      : 300;

  try {
    const active = await hasActiveCdnUploadJob();
    if (active) {
      return res
        .status(409)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "A CDN upload job is already pending or running."
          )
        );
    }

    const { job, batches } = await startCdnUploadJob({ limitCount: limit });

    return res.status(201).json(
      successHandler({
        job,
        batches,
        batch_count: batches.length,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error creating the CDN upload job.",
          error
        )
      );
  }
};

export const deleteCdnUploadJobsHandler = async (req, res) => {
  const { job_ids } = req.body;

  try {
    const data = await deleteCdnUploadJobs(job_ids);
    return res.status(200).json(
      successHandler({
        deleted: data?.length ?? 0,
        ids: (data ?? []).map((row) => row.id),
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting CDN upload jobs.",
          error
        )
      );
  }
};

export const getEmailScrapePendingCount = async (req, res) => {
  try {
    const pending_count = await countPendingEmailScrapeBusinesses();
    return res.status(200).json(successHandler({ pending_count }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the pending email scrape count.",
          error
        )
      );
  }
};

export const getEmailScrapeBusinesses = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const q = rawQ ? rawQ.slice(0, 100) : null;

  const parseBool = (value) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return null;
  };
  const hasEmail = parseBool(req.query.has_email);
  const hasAttempts = parseBool(req.query.has_attempts);
  const emailStatus =
    typeof req.query.email_status === "string" && req.query.email_status.trim()
      ? req.query.email_status.trim()
      : null;

  try {
    const result = await listEmailScrapeBusinesses(page, limit, {
      q,
      hasEmail,
      hasAttempts,
      emailStatus,
    });

    const total = result.count ?? 0;
    let totalPages = Math.ceil(total / result.limit) || 0;
    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    return res.status(200).json(
      successHandler({
        businesses: result.businesses,
        pagination: {
          page: result.page,
          limit: result.limit,
          total,
          totalPages,
        },
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching email scrape businesses.",
          error
        )
      );
  }
};

export const getEmailScrapeJobs = async (req, res) => {
  try {
    const jobs = await listEmailScrapeJobs();
    return res.status(200).json(successHandler({ jobs }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching email scrape jobs.",
          error
        )
      );
  }
};

export const getEmailScrapeJobById = async (req, res) => {
  const { jobId } = req.params;

  try {
    const detail = await getEmailScrapeJobDetail(jobId);

    if (!detail) {
      return res
        .status(404)
        .json(customErrorHandler(SUPABASE_ERROR, "Email scrape job not found."));
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the email scrape job.",
          error
        )
      );
  }
};

export const getEmailScrapeBatchById = async (req, res) => {
  const { batchId } = req.params;

  try {
    const detail = await getEmailScrapeBatchDetail(batchId);

    if (!detail) {
      return res
        .status(404)
        .json(
          customErrorHandler(SUPABASE_ERROR, "Email scrape batch not found.")
        );
    }

    return res.status(200).json(successHandler(detail));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the email scrape batch.",
          error
        )
      );
  }
};

export const createEmailScrapeJobHandler = async (req, res) => {
  const limit =
    typeof req.body?.limit === "number" && Number.isFinite(req.body.limit)
      ? req.body.limit
      : 300;

  try {
    const active = await hasActiveEmailScrapeJob();
    if (active) {
      return res
        .status(409)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "An email scrape job is already pending or running."
          )
        );
    }

    const { job, batches } = await startEmailScrapeJob({ limitCount: limit });

    return res.status(201).json(
      successHandler({
        job,
        batches,
        batch_count: batches.length,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error creating the email scrape job.",
          error
        )
      );
  }
};

export const deleteEmailScrapeJobsHandler = async (req, res) => {
  const { job_ids } = req.body;

  try {
    const data = await deleteEmailScrapeJobs(job_ids);
    return res.status(200).json(
      successHandler({
        deleted: data?.length ?? 0,
        ids: (data ?? []).map((row) => row.id),
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting email scrape jobs.",
          error
        )
      );
  }
};
