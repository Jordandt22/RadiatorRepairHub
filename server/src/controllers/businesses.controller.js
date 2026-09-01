import {
  errorCodes,
  customErrorHandler,
  successHandler,
  claimUnavailableHandler,
} from "../helpers/customErrorHandler.js";
import { gateOwnedBusinessStats } from "../lib/gateOwnedBusinessStats.js";
import { gateCompetitorInsights } from "../lib/gateCompetitorInsights.js";
import {
  cacheData,
  getFeaturedBusinessesKey,
  getTopVerifiedBusinessesKey,
  getCacheData,
  getBusinessBySlugKey,
  getBusinessSlugsForSitemapKey,
  getSearchedBusinessesKey,
  getCountBusinessesBySearchKey,
  getClaimRequestCodeKey,
  getBusinessByIdKey,
  setWithExactTtl,
  deleteCacheData,
  deleteCacheDataByPrefix,
} from "../redis/redis.js";
import {
  getPaidFeaturedBusinesses,
  FEATURED_PAGE_SIZE,
  getTopVerifiedBusinesses,
  searchBusinesses,
  getBusinessBySlug,
  getBusinessSlugsForSitemap,
  getBusinessClaimInfo,
  isBusinessEmailShared,
  getBusinessLastEditedAt,
  getBusinessEmailStatus,
  getBusinessClaimFlags,
  insertClaimRequest,
  updateClaimRequestStatus,
  getClaimRequestWithBusiness,
  deleteClaimRequest,
  completeBusinessClaimRpc,
  createAuthUser,
  deleteAuthUser,
  signInWithPassword,
  formatAuthSession,
  resetClaimAttempts,
  incrementClaimAttempts,
  getOwnedBusinesses,
  getOwnedBusiness,
  getBusinessStatsForOwner,
  getCompetitorInsightsForOwner,
  unclaimOwnedBusiness,
  updateOwnedBusinessContact,
  updateOwnedBusinessPrimaryCategory,
  updateOwnedBusinessAmenities,
  updateOwnedBusinessAbout,
  updateOwnedBusinessHours,
  getOwnedBusinessSecondaryCategoryIds,
  syncOwnedBusinessSecondaryCategories,
  touchOwnedBusinessEditedAt,
  getBusinessById,
  updateBusinessDerivedSeo,
  listBusinessImagesByBusinessId,
  insertOwnedBusinessImage,
  setOwnedBusinessImagePrimary,
  clearOwnedBusinessImagePrimary,
  setOwnedBusinessImageHidden,
  setOwnedBusinessHideDefaultImage,
  deleteOwnedBusinessImageRow,
  markOwnedBusinessCdnStored,
} from "../supabase/supabase.functions.js";
import {
  getBusinessImageLimit,
  selectPublicGalleryImages,
  withDefaultListingImage,
  detectImageMime,
  FEATURED_IMAGE_LIMIT,
  DEFAULT_LISTING_IMAGE_ID,
  MAX_OWNER_IMAGE_BYTES,
  OWNER_IMAGE_MIME_TYPES,
} from "../lib/businessImages.js";
import {
  buildBusinessImagePublicId,
  uploadBufferToCloudflareImages,
  deleteCloudflareImage,
} from "../cdn-upload/cloudflareImages.js";
import { getNestedValue } from "../lib/util.js";
import { sanitizeIlikeSearch } from "../lib/sanitizeSearch.js";
import { buildDerivedListingSeo } from "../lib/listingSeo.js";
import {
  daysEqual,
  normalizeDayHours,
  normalizeIncomingHours,
  WEEKDAYS,
} from "../lib/businessHoursFormat.js";
import { resendClient } from "../resend/resend.js";
import {
  ADMIN_BUSINESS_CLAIMED_MESSAGE,
  OWNER_CLAIM_THANK_YOU_MESSAGE,
  CLAIM_VERIFICATION_MESSAGE,
  SENDER_NAME,
  buildClaimVerifyLink,
  buildBusinessClaimLink,
  getWebBaseUrl,
  maskEmail,
} from "../lib/constants/messages.js";
import {
  MAX_CLAIM_ATTEMPTS,
  CLAIM_RESTART_MESSAGE,
  CLAIM_MAX_ATTEMPTS_MESSAGE,
  expireStaleClaimIfNeeded,
  failClaimForMaxAttempts,
  expireStalePendingClaimsForBusiness,
} from "../lib/claimHelpers.js";
import {
  EMAIL_STATUS,
  EMAIL_UNDER_REVIEW_MESSAGE,
  isEmailUnderReview,
} from "../lib/emailStatus.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { verifyPhoneNumber } from "../abstract/phoneValidation.js";
import { verifyWebsiteReachable } from "../lib/websiteReachability.js";
import { cancelFeaturedSubscriptionForBusiness } from "../lib/cancelFeaturedSubscriptions.js";
import {
  invalidateBusinessListingCache,
  invalidateClaimStatusCaches,
} from "../lib/invalidateListingCaches.js";
import crypto from "crypto";

const { SUPABASE_ERROR, ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR, ACCESS_DENIED } =
  errorCodes;

const CLAIM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateClaimCode = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CLAIM_CODE_CHARS[bytes[i] % CLAIM_CODE_CHARS.length];
  }
  return code;
};

const respondEmailUnderReview = (res) =>
  res
    .status(422)
    .json(customErrorHandler(YUP_ERROR, EMAIL_UNDER_REVIEW_MESSAGE));

export const claimBusiness = async (req, res) => {
  const { businessId } = req.body;

  const { data: business, error: businessError } =
    await getBusinessClaimInfo(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const email =
    typeof business.email === "string" ? business.email.trim() : "";

  if (!email) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "This business cannot be claimed because it has no email on file."
        )
      );
  }

  if (isEmailUnderReview(business.email_status)) {
    return respondEmailUnderReview(res);
  }

  const { isShared, error: sharedEmailError } =
    await isBusinessEmailShared(email);

  if (sharedEmailError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error checking whether this business can be claimed.",
          sharedEmailError
        )
      );
  }

  if (isShared) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "This business cannot be claimed because its email is shared with other listings."
        )
      );
  }

  if (business.is_claimed) {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "This business has already been claimed."
        )
      );
  }

  const { error: expireError, remainingPending } =
    await expireStalePendingClaimsForBusiness(business.id);

  if (expireError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error checking existing claim requests.",
          expireError
        )
      );
  }

  if (remainingPending.length > 0) {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "A claim request for this business is already in progress."
        )
      );
  }

  const { data: claimRequest, error: insertError } =
    await insertClaimRequest(business.id);

  if (insertError || !claimRequest) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error creating your claim request.",
          insertError
        )
      );
  }

  const claimRequestId = claimRequest.claim_request_id;
  const code = generateClaimCode(6);
  const { key, interval } = getClaimRequestCodeKey(claimRequestId);

  try {
    await setWithExactTtl(key, interval, code);
  } catch (redisError) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error storing the verification code.",
          redisError
        )
      );
  }

  const { SENDER_EMAIL, RESEND_API_KEY, TEST_RECIPIENT_EMAIL } = process.env;
  const isDev = process.env.NODE_ENV === "development";

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email is not configured. Unable to send the verification code."
        )
      );
  }

  if (isDev && !TEST_RECIPIENT_EMAIL) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "TEST_RECIPIENT_EMAIL is required in development."
        )
      );
  }

  const recipientEmail = isDev ? TEST_RECIPIENT_EMAIL : email;
  const verifyUrl = buildClaimVerifyLink(claimRequestId);
  const businessPageUrl = buildBusinessClaimLink(business.slug);
  const { error: sendError } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [recipientEmail],
    subject: CLAIM_VERIFICATION_MESSAGE.subject(business.title),
    html: CLAIM_VERIFICATION_MESSAGE.html(
      business.title,
      code,
      verifyUrl,
      businessPageUrl
    ),
  });

  if (sendError) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    try {
      await deleteCacheData(key);
    } catch {
      // best-effort cleanup
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error sending the verification email.",
          sendError
        )
      );
  }

  await invalidateBusinessCache(business);

  return res.status(201).json(
    successHandler({
      maskedEmail: maskEmail(email),
      claimRequestId,
    })
  );
};

const invalidateBusinessCache = async (business) => {
  await invalidateBusinessListingCache(business);
};

const refreshOwnedListingDerivedSeo = async (businessId, listing, fields) => {
  try {
    const payload = buildDerivedListingSeo(listing, { fields });
    if (!payload || Object.keys(payload).length === 0) return;

    const { error } = await updateBusinessDerivedSeo(businessId, payload);
    if (error) {
      console.error("Derived listing SEO update failed:", error);
    }
  } catch (error) {
    console.error("Derived listing SEO update failed:", error);
  }
};

export const getClaimRequest = async (req, res) => {
  const { claim_request_id } = req.params;

  const { data: claim, error } =
    await getClaimRequestWithBusiness(claim_request_id);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the claim request.",
          error
        )
      );
  }

  if (!claim) {
    return res
      .status(404)
      .json(
        customErrorHandler(ROUTE_NOT_FOUND, "Claim request could not be found.")
      );
  }

  const business = claim.business;
  if (!business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The business for this claim request could not be found."
        )
      );
  }

  if (claim.status !== "pending") {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This claim request is no longer available.",
          business
        )
      );
  }

  if (await expireStaleClaimIfNeeded(claim)) {
    return res
      .status(422)
      .json(claimUnavailableHandler(CLAIM_RESTART_MESSAGE, business));
  }

  if (business.is_claimed) {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This business has already been claimed.",
          business
        )
      );
  }

  const email =
    typeof business.email === "string" ? business.email.trim() : "";
  if (!email) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "This business cannot be claimed because it has no email on file."
        )
      );
  }

  if (isEmailUnderReview(business.email_status)) {
    return respondEmailUnderReview(res);
  }

  return res.status(200).json(
    successHandler({
      claimRequestId: claim.claim_request_id,
      business: {
        id: business.id,
        title: business.title,
        slug: business.slug,
        email,
      },
    })
  );
};

export const cancelClaim = async (req, res) => {
  const { claimRequestId } = req.body;

  const { data: claim, error } =
    await getClaimRequestWithBusiness(claimRequestId);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the claim request.",
          error
        )
      );
  }

  if (!claim) {
    return res
      .status(404)
      .json(
        customErrorHandler(ROUTE_NOT_FOUND, "Claim request could not be found.")
      );
  }

  const business = claim.business;

  if (claim.status !== "pending") {
    return res.status(200).json(
      successHandler({
        slug: business?.slug ?? null,
      })
    );
  }

  const { key: codeKey } = getClaimRequestCodeKey(claimRequestId);

  const { data: deleted, error: deleteError } =
    await deleteClaimRequest(claimRequestId);
  if (deleteError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error canceling the claim request.",
          deleteError
        )
      );
  }

  if (!deleted) {
    return res.status(200).json(
      successHandler({
        slug: business?.slug ?? null,
      })
    );
  }

  try {
    await deleteCacheData(codeKey);
  } catch {
    // best-effort cleanup
  }

  if (business) {
    await invalidateBusinessCache(business);
  }

  return res.status(200).json(
    successHandler({
      slug: business?.slug ?? null,
    })
  );
};

export const completeClaim = async (req, res) => {
  const { claimRequestId, code, password } = req.body;
  const normalizedCode = String(code).trim().toUpperCase();

  const { data: claim, error } =
    await getClaimRequestWithBusiness(claimRequestId);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the claim request.",
          error
        )
      );
  }

  if (!claim) {
    return res
      .status(404)
      .json(
        customErrorHandler(ROUTE_NOT_FOUND, "Claim request could not be found.")
      );
  }

  const business = claim.business;
  if (!business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The business for this claim request could not be found."
        )
      );
  }

  if (claim.status !== "pending") {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This claim request is no longer available.",
          business
        )
      );
  }

  if (await expireStaleClaimIfNeeded(claim)) {
    return res
      .status(422)
      .json(claimUnavailableHandler(CLAIM_RESTART_MESSAGE, business));
  }

  if (business.is_claimed) {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This business has already been claimed.",
          business
        )
      );
  }

  const email =
    typeof business.email === "string" ? business.email.trim() : "";
  if (!email) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "This business cannot be claimed because it has no email on file."
        )
      );
  }

  if (isEmailUnderReview(business.email_status)) {
    return respondEmailUnderReview(res);
  }

  const { key: codeKey } = getClaimRequestCodeKey(claimRequestId);

  if (Number(claim.attempts || 0) >= MAX_CLAIM_ATTEMPTS) {
    await failClaimForMaxAttempts(claimRequestId);
    return res
      .status(422)
      .json(claimUnavailableHandler(CLAIM_MAX_ATTEMPTS_MESSAGE, business));
  }

  const { data: attemptData, error: attemptError } = await incrementClaimAttempts(
    claimRequestId,
    claim.attempts
  );
  if (attemptError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error recording the claim attempt.",
          attemptError
        )
      );
  }

  const attempts = Number(attemptData?.attempts || Number(claim.attempts || 0) + 1);

  let cachedCode = null;
  try {
    cachedCode = await getCacheData(codeKey);
  } catch (redisError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error checking the verification code.",
          redisError
        )
      );
  }

  if (!cachedCode?.data) {
    if (attempts >= MAX_CLAIM_ATTEMPTS) {
      await failClaimForMaxAttempts(claimRequestId);
      return res
        .status(422)
        .json(claimUnavailableHandler(CLAIM_MAX_ATTEMPTS_MESSAGE, business));
    }

    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "Verification code expired. Please resend a new verification code."
        )
      );
  }

  const storedCode = String(cachedCode.data).trim().toUpperCase();
  if (storedCode !== normalizedCode) {
    if (attempts >= MAX_CLAIM_ATTEMPTS) {
      await failClaimForMaxAttempts(claimRequestId);
      return res
        .status(422)
        .json(claimUnavailableHandler(CLAIM_MAX_ATTEMPTS_MESSAGE, business));
    }

    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, "Incorrect verification code."));
  }

  const authenticatedUser = req.user ?? null;
  let uid = authenticatedUser?.id ?? null;
  let createdAuthUser = false;

  if (!uid) {
    const { data: authData, error: authError } = await createAuthUser({
      email,
      password,
    });

    if (authError || !authData?.user?.id) {
      const message =
        authError?.message?.toLowerCase?.().includes("already") ||
        authError?.status === 422
          ? "An account with this email already exists."
          : "There was an error creating your account.";

      return res
        .status(
          authError?.message?.toLowerCase?.().includes("already") ? 409 : 500
        )
        .json(
          customErrorHandler(
            authError?.message?.toLowerCase?.().includes("already")
              ? ACCESS_DENIED
              : SERVER_ERROR,
            message,
            authError
          )
        );
    }

    uid = authData.user.id;
    createdAuthUser = true;
  }

  const { error: rpcError } = await completeBusinessClaimRpc(
    claimRequestId,
    business.id,
    uid
  );

  if (rpcError) {
    if (createdAuthUser) {
      try {
        await deleteAuthUser(uid);
      } catch {
        // best-effort cleanup
      }
    }

    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error completing the business claim.",
          rpcError
        )
      );
  }

  try {
    await deleteCacheData(codeKey);
  } catch {
    // best-effort cleanup
  }

  await invalidateClaimStatusCaches(business);

  const { SENDER_EMAIL, RESEND_API_KEY, ADMIN_EMAIL, TEST_RECIPIENT_EMAIL } =
    process.env;
  const isDev = process.env.NODE_ENV === "development";
  const businessPageUrl = buildBusinessClaimLink(business.slug);

  if (RESEND_API_KEY && SENDER_EMAIL && ADMIN_EMAIL) {
    const { error: adminSendError } = await resendClient().emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: ADMIN_BUSINESS_CLAIMED_MESSAGE.subject(business.title),
      html: ADMIN_BUSINESS_CLAIMED_MESSAGE.html(business.title, {
        email,
        businessPageUrl,
      }),
    });

    if (adminSendError && isDev) {
      console.error(
        "Failed to send admin business-claimed email:",
        adminSendError
      );
    }
  }

  if (RESEND_API_KEY && SENDER_EMAIL && (!isDev || TEST_RECIPIENT_EMAIL)) {
    const ownerRecipient = isDev ? TEST_RECIPIENT_EMAIL : email;
    const dashboardUrl = `${getWebBaseUrl()}/dashboard`;
    const { error: thankYouSendError } = await resendClient().emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [ownerRecipient],
      subject: OWNER_CLAIM_THANK_YOU_MESSAGE.subject(business.title),
      html: OWNER_CLAIM_THANK_YOU_MESSAGE.html(business.title, {
        businessPageUrl,
        dashboardUrl,
      }),
    });

    if (thankYouSendError && isDev) {
      console.error(
        "Failed to send owner claim thank-you email:",
        thankYouSendError
      );
    }
  }

  if (authenticatedUser) {
    return res.status(201).json(
      successHandler({
        slug: business.slug,
        alreadyAuthenticated: true,
        session: null,
      })
    );
  }

  const { data: signInData, error: signInError } = await signInWithPassword({
    email,
    password,
  });

  const session = formatAuthSession(signInData?.session);

  if (signInError || !session) {
    return res.status(201).json(
      successHandler({
        slug: business.slug,
        session: null,
        requiresLogin: true,
        message:
          "Your business was claimed, but we couldn't sign you in automatically. Please sign in to continue.",
      })
    );
  }

  return res.status(201).json(
    successHandler({
      slug: business.slug,
      session,
    })
  );
};

export const resendClaim = async (req, res) => {
  const { claimRequestId } = req.body;

  const { data: claim, error } =
    await getClaimRequestWithBusiness(claimRequestId);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the claim request.",
          error
        )
      );
  }

  if (!claim) {
    return res
      .status(404)
      .json(
        customErrorHandler(ROUTE_NOT_FOUND, "Claim request could not be found.")
      );
  }

  const business = claim.business;
  if (!business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The business for this claim request could not be found."
        )
      );
  }

  if (claim.status !== "pending") {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This claim request is no longer available.",
          business
        )
      );
  }

  if (await expireStaleClaimIfNeeded(claim)) {
    return res
      .status(422)
      .json(claimUnavailableHandler(CLAIM_RESTART_MESSAGE, business));
  }

  if (business.is_claimed) {
    return res
      .status(409)
      .json(
        claimUnavailableHandler(
          "This business has already been claimed.",
          business
        )
      );
  }

  const email =
    typeof business.email === "string" ? business.email.trim() : "";
  if (!email) {
    return res
      .status(422)
      .json(
        customErrorHandler(
          YUP_ERROR,
          "This business cannot be claimed because it has no email on file."
        )
      );
  }

  if (isEmailUnderReview(business.email_status)) {
    return respondEmailUnderReview(res);
  }

  const { key, interval } = getClaimRequestCodeKey(claimRequestId);

  try {
    await deleteCacheData(key);
  } catch {
    // best-effort cleanup of old code
  }

  const code = generateClaimCode(6);

  try {
    await setWithExactTtl(key, interval, code);
  } catch (redisError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error storing the verification code.",
          redisError
        )
      );
  }

  const { error: resetError } = await resetClaimAttempts(claimRequestId);
  if (resetError) {
    try {
      await deleteCacheData(key);
    } catch {
      // best-effort cleanup
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error resetting claim attempts.",
          resetError
        )
      );
  }

  const { SENDER_EMAIL, RESEND_API_KEY, TEST_RECIPIENT_EMAIL } = process.env;
  const isDev = process.env.NODE_ENV === "development";

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    try {
      await deleteCacheData(key);
    } catch {
      // best-effort cleanup
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email is not configured. Unable to send the verification code."
        )
      );
  }

  if (isDev && !TEST_RECIPIENT_EMAIL) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    try {
      await deleteCacheData(key);
    } catch {
      // best-effort cleanup
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "TEST_RECIPIENT_EMAIL is required in development."
        )
      );
  }

  const recipientEmail = isDev ? TEST_RECIPIENT_EMAIL : email;
  const verifyUrl = buildClaimVerifyLink(claimRequestId);
  const businessPageUrl = buildBusinessClaimLink(business.slug);
  const { error: sendError } = await resendClient().emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [recipientEmail],
    subject: CLAIM_VERIFICATION_MESSAGE.subject(business.title),
    html: CLAIM_VERIFICATION_MESSAGE.html(
      business.title,
      code,
      verifyUrl,
      businessPageUrl
    ),
  });

  if (sendError) {
    await updateClaimRequestStatus(claimRequestId, "failed");
    try {
      await deleteCacheData(key);
    } catch {
      // best-effort cleanup
    }
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error sending the verification email.",
          sendError
        )
      );
  }

  return res.status(200).json(
    successHandler({
      maskedEmail: maskEmail(email),
    })
  );
};

export const getOwnedBusinessesHandler = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { data, error } = await getOwnedBusinesses(ownerUid, accessToken);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching your businesses.",
          error
        )
      );
  }

  return res.status(200).json(successHandler(data ?? []));
};

function parseOwnedStatsDays(rawValue) {
  const normalized = String(rawValue ?? "").toLowerCase();
  if (normalized === "all") return "all";
  const parsed = Number(rawValue);
  return parsed === 1 || parsed === 7 || parsed === 30 ? parsed : 7;
}

export const getOwnedBusinessStatsHandler = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId } = req.params;
  const days = parseOwnedStatsDays(req.query.days);

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data, error } = await getBusinessStatsForOwner(
    businessId,
    days,
    accessToken
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching listing stats.",
          error
        )
      );
  }

  const gatedData = gateOwnedBusinessStats(data, Boolean(profile.is_featured));

  return res.status(200).json(successHandler(gatedData));
};

export const getOwnedCompetitorInsightsHandler = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId } = req.params;
  const days = parseOwnedStatsDays(req.query.days);

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data, error } = await getCompetitorInsightsForOwner(businessId, days);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching competitor insights.",
          error
        )
      );
  }

  const gatedData = gateCompetitorInsights(
    data,
    Boolean(profile.is_featured)
  );

  return res.status(200).json(successHandler(gatedData));
};

export const unclaimOwnedBusinessHandler = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId } = req.body;

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  let cancelResult;
  try {
    cancelResult = await cancelFeaturedSubscriptionForBusiness(
      businessId,
      ownerUid,
      { reason: "listing_unclaimed" }
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error canceling the Featured subscription for this listing. Please try again or contact support.",
          error
        )
      );
  }

  if (cancelResult?.errors?.length) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error canceling the Featured subscription for this listing. Please try again or contact support.",
          cancelResult.errors
        )
      );
  }

  const { data: unclaimed, error: unclaimError } = await unclaimOwnedBusiness(
    businessId,
    ownerUid
  );

  if (unclaimError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error unclaiming this business.",
          unclaimError
        )
      );
  }

  if (!unclaimed) {
    return res
      .status(409)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "This business is no longer claimed by your account."
        )
      );
  }

  try {
    await invalidateClaimStatusCaches(unclaimed);
  } catch {
    // best-effort cache cleanup
  }

  return res.status(200).json(
    successHandler({
      business_id: unclaimed.id,
      slug: unclaimed.slug,
      message: "Your listing has been unclaimed.",
    })
  );
};

export const updateBusinessContact = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId, phone, email, website } = req.body;
  const normalizedEmail =
    typeof email === "string" && email.trim() ? email.trim() : null;
  const normalizedWebsite =
    typeof website === "string" && website.trim() ? website.trim() : null;
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const existingPhone = typeof profile.phone === "string" ? profile.phone.trim() : "";
  const existingEmail =
    typeof profile.email === "string" && profile.email.trim()
      ? profile.email.trim()
      : null;
  const existingWebsite =
    typeof profile.website === "string" && profile.website.trim()
      ? profile.website.trim()
      : null;

  const phoneDigits = (value) => String(value ?? "").replace(/\D/g, "");
  const phoneChanged = phoneDigits(normalizedPhone) !== phoneDigits(existingPhone);
  const emailChanged = (normalizedEmail || null) !== (existingEmail || null);
  const websiteChanged = (normalizedWebsite || null) !== (existingWebsite || null);

  if (phoneChanged) {
    const phoneResult = await verifyPhoneNumber(normalizedPhone);
    if (!phoneResult.ok) {
      const status =
        phoneResult.error?.type === "config" || phoneResult.error?.type === "api"
          ? 503
          : 422;
      return res.status(status).json(
        customErrorHandler(
          YUP_ERROR,
          {
            phone:
              phoneResult.error?.message ||
              "Please enter a valid phone number.",
          },
          phoneResult.error
        )
      );
    }
  }

  if (normalizedEmail && emailChanged) {
    const emailResult = await verifyEmailReputation(normalizedEmail);
    if (!emailResult.ok) {
      const status =
        emailResult.error?.type === "config" || emailResult.error?.type === "api"
          ? 503
          : 422;
      return res.status(status).json(
        customErrorHandler(
          YUP_ERROR,
          {
            email:
              emailResult.error?.message ||
              "Please enter a valid email address.",
          },
          emailResult.error
        )
      );
    }
  }

  let savedWebsite = normalizedWebsite;
  if (normalizedWebsite && websiteChanged) {
    const websiteResult = await verifyWebsiteReachable(normalizedWebsite);
    if (!websiteResult.ok) {
      return res.status(422).json(
        customErrorHandler(
          YUP_ERROR,
          {
            website:
              websiteResult.error?.message ||
              "This website does not appear to be reachable.",
          },
          websiteResult.error
        )
      );
    }
    savedWebsite = websiteResult.url || normalizedWebsite;
  } else if (!websiteChanged && existingWebsite) {
    savedWebsite = existingWebsite;
  }

  const { data: updated, error: updateError } = await updateOwnedBusinessContact(
    businessId,
    ownerUid,
    {
      phone: normalizedPhone,
      email: normalizedEmail,
      website: savedWebsite,
      ...(emailChanged
        ? {
            email_status: EMAIL_STATUS.CHECKED,
            email_status_marked_at: new Date().toISOString(),
          }
        : {}),
    },
    accessToken
  );

  if (updateError || !updated) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact information.",
          updateError
        )
      );
  }

  const { data: business } = await getBusinessById(businessId);
  if (business) {
    await invalidateBusinessCache(business);
  }
  if (emailChanged) {
    await deleteCacheDataByPrefix("FEATURED_BUSINESSES");
    await deleteCacheDataByPrefix("SEARCHED_BUSINESSES");
  }

  return res.status(200).json(
    successHandler({
      phone: updated.phone,
      email: updated.email,
      website: updated.website,
      last_edited_at: updated.last_edited_at,
    })
  );
};

export const updateBusinessCategories = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId, primaryCategoryId, secondaryCategoryIds = [] } = req.body;
  const nextSecondaryIds = [...new Set(secondaryCategoryIds ?? [])];

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data: business, error: businessError } =
    await getBusinessById(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const currentPrimaryId = business.primary_category_id ?? business.primary_category?.id;
  const primaryChanged = currentPrimaryId !== primaryCategoryId;

  const { data: currentSecondaryIds, error: secondaryReadError } =
    await getOwnedBusinessSecondaryCategoryIds(businessId, accessToken);

  if (secondaryReadError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error loading secondary categories.",
          secondaryReadError
        )
      );
  }

  const currentSorted = [...(currentSecondaryIds ?? [])].sort().join(",");
  const nextSorted = [...nextSecondaryIds].sort().join(",");
  const secondaryChanged = currentSorted !== nextSorted;

  if (!primaryChanged && !secondaryChanged) {
    return res.status(200).json(
      successHandler({
        primaryCategoryId: currentPrimaryId,
        secondaryCategoryIds: currentSecondaryIds ?? [],
      })
    );
  }

  if (primaryChanged) {
    const { data: updatedPrimary, error: primaryError } =
      await updateOwnedBusinessPrimaryCategory(
        businessId,
        primaryCategoryId,
        accessToken
      );

    if (primaryError || !updatedPrimary) {
      return res.status(422).json(
        customErrorHandler(
          YUP_ERROR,
          {
            primaryCategoryId:
              primaryError?.message ||
              "Unable to update primary category.",
          },
          primaryError
        )
      );
    }
  }

  if (secondaryChanged) {
    const { error: syncError } = await syncOwnedBusinessSecondaryCategories(
      businessId,
      nextSecondaryIds,
      accessToken
    );

    if (syncError) {
      return res.status(422).json(
        customErrorHandler(
          YUP_ERROR,
          {
            secondaryCategoryIds:
              syncError?.message ||
              "Unable to update secondary categories.",
          },
          syncError
        )
      );
    }
  }

  await touchOwnedBusinessEditedAt(businessId, ownerUid, accessToken);

  const { data: refreshed, error: refreshError } =
    await getBusinessById(businessId);
  if (refreshError) {
    console.error("Derived listing SEO reload failed:", refreshError);
  } else {
    await refreshOwnedListingDerivedSeo(businessId, refreshed, [
      "title_tag",
      "keywords",
    ]);
  }

  await invalidateBusinessCache(business);

  return res.status(200).json(
    successHandler({
      primaryCategoryId,
      secondaryCategoryIds: nextSecondaryIds,
    })
  );
};

export const updateBusinessAmenities = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId, features } = req.body;

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data: business, error: businessError } =
    await getBusinessById(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const current = business.features || {};
  const amenityKeys = [
    "appointments_recommended",
    "credit_cards",
    "debit_cards",
    "mechanic",
    "nfc_mobile_payments",
    "oil_change",
    "onsite_services",
    "restroom",
    "wheelchair_accessible",
  ];
  const hasChanges = amenityKeys.some(
    (key) => Boolean(current[key]) !== Boolean(features[key])
  );

  if (!hasChanges) {
    return res.status(200).json(
      successHandler({
        features: Object.fromEntries(
          amenityKeys.map((key) => [key, Boolean(current[key])])
        ),
      })
    );
  }

  const { data: updated, error: updateError } =
    await updateOwnedBusinessAmenities(businessId, features, accessToken);

  if (updateError || !updated) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating amenities.",
          updateError
        )
      );
  }

  await touchOwnedBusinessEditedAt(businessId, ownerUid, accessToken);
  await refreshOwnedListingDerivedSeo(
    businessId,
    {
      ...business,
      features: {
        ...(business.features || {}),
        ...updated,
      },
    },
    ["highlights"]
  );
  await invalidateBusinessCache(business);

  return res.status(200).json(
    successHandler({
      features: Object.fromEntries(
        amenityKeys.map((key) => [key, Boolean(updated[key])])
      ),
    })
  );
};

export const updateBusinessAbout = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId } = req.body;
  const description = String(req.body.description ?? "").trim();

  if (!description) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        description: "About text is required.",
      })
    );
  }

  if (description.length > 750) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        description: "About text must be 750 characters or fewer.",
      })
    );
  }

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data: business, error: businessError } =
    await getBusinessById(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const currentDescription = String(business.description ?? "").trim();
  if (currentDescription === description) {
    return res.status(200).json(successHandler({ description }));
  }

  const { data: updated, error: updateError } = await updateOwnedBusinessAbout(
    businessId,
    ownerUid,
    description,
    accessToken
  );

  if (updateError || !updated) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating the about section.",
          updateError
        )
      );
  }

  await refreshOwnedListingDerivedSeo(
    businessId,
    {
      ...business,
      description: updated.description,
    },
    ["meta_description", "local_note"]
  );
  await invalidateBusinessCache(business);

  return res.status(200).json(
    successHandler({
      description: updated.description,
    })
  );
};

export const updateBusinessHours = async (req, res) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
  }

  const { businessId, days } = req.body;

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error verifying business ownership.",
          profileError
        )
      );
  }

  if (!profile) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
  }

  const { data: business, error: businessError } =
    await getBusinessById(businessId);

  if (businessError || !business) {
    return res
      .status(404)
      .json(
        customErrorHandler(
          ROUTE_NOT_FOUND,
          "The selected business could not be found.",
          businessError
        )
      );
  }

  const normalizedDays = WEEKDAYS.map((dayOfWeek) => {
    const match = (days || []).find((day) => day.day_of_week === dayOfWeek);
    return normalizeDayHours({
      day_of_week: dayOfWeek,
      is_closed: Boolean(match?.is_closed),
      hours: match?.is_closed ? [] : match?.hours || [],
    });
  });

  const currentDays = normalizeIncomingHours(business.hours || []).map(
    (day) => normalizeDayHours(day)
  );

  if (daysEqual(normalizedDays, currentDays)) {
    return res.status(200).json(
      successHandler({
        days: currentDays,
      })
    );
  }

  const { data: updatedDays, error: hoursError } =
    await updateOwnedBusinessHours(businessId, normalizedDays, accessToken);

  if (hoursError || !updatedDays) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating business hours.",
          hoursError
        )
      );
  }

  await touchOwnedBusinessEditedAt(businessId, ownerUid, accessToken);
  await invalidateBusinessCache(business);

  return res.status(200).json(
    successHandler({
      days: updatedDays.map((day) => ({
        day_of_week: day.day_of_week,
        is_closed: day.is_closed,
        hours: day.hours,
        hours_text: day.hours_text,
      })),
    })
  );
};

export const getFeaturedBusinesses = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || FEATURED_PAGE_SIZE;
  const sort = req.query.sort || "featured";
  const q = sanitizeIlikeSearch(req.query.q);

  const { key, interval } = getFeaturedBusinessesKey(page, limit, sort, q);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await getPaidFeaturedBusinesses({
    page,
    limit,
    sort,
    q,
  });
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching featured businesses.",
          error
        )
      );
  }

  const total = count ?? 0;
  const payload = {
    businesses: data ?? [],
    total,
    page,
    limit,
    totalPages: total > 0 ? Math.ceil(total / limit) : 0,
  };

  await cacheData(key, interval, payload);
  res.status(200).json(successHandler(payload));
};

export const getTopVerifiedBusinessesHandler = async (req, res) => {
  const { key, interval } = getTopVerifiedBusinessesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getTopVerifiedBusinesses();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching verified businesses.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getBusinessSlugsForSitemapHandler = async (req, res) => {
  const { key, interval } = getBusinessSlugsForSitemapKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, error } = await getBusinessSlugsForSitemap();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching business slugs for sitemap.",
          error
        )
      );
  }

  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getBusiness = async (req, res) => {
  const { business_slug } = req.params;

  // Get Cache Data
  const { key, interval } = getBusinessBySlugKey(business_slug);
  const cachedData = await getCacheData(key);
  let business = cachedData?.data ?? null;

  if (!business) {
    // Get Business by Slug
    const { data, error } = await getBusinessBySlug(business_slug);
    if (error) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            `There was an error fetching business by Slug (${business_slug}).`,
            error
          )
        );
    }

    business = data;
    await cacheData(key, interval, business);
  }

  let email = business?.email ?? null;
  let emailStatus = business?.email_status ?? null;
  let isClaimed = Boolean(business?.is_claimed);
  let isFeatured = Boolean(business?.is_featured);
  let ownerUid = business?.owner_uid ?? null;

  if (business?.id) {
    const { data: liveEmail, error: emailStatusError } =
      await getBusinessEmailStatus(business.id);
    if (!emailStatusError && liveEmail) {
      email = liveEmail.email ?? null;
      if (liveEmail.email_status != null) {
        emailStatus = liveEmail.email_status;
      }
    }

    // Always refresh claim/Featured flags so stale Redis cannot keep Verified.
    const { data: claimFlags, error: claimFlagsError } =
      await getBusinessClaimFlags(business.id);
    if (!claimFlagsError && claimFlags) {
      isClaimed = claimFlags.is_claimed;
      isFeatured = claimFlags.is_featured;
      ownerUid = claimFlags.owner_uid;
    }
  }

  // Always compute at response time so claimability stays correct if emails change
  // while a listing is still cached.
  const { isShared, error: sharedEmailError } = await isBusinessEmailShared(
    email
  );

  if (sharedEmailError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error checking claim eligibility for business (${business_slug}).`,
          sharedEmailError
        )
      );
  }

  // Always refresh last_edited_at for claimed listings so stale Redis payloads
  // still show the edit date under the verified badge.
  let lastEditedAt = business?.last_edited_at ?? null;
  if (isClaimed && business?.id) {
    const { data: editedAt, error: editedAtError } =
      await getBusinessLastEditedAt(business.id);
    if (!editedAtError) {
      lastEditedAt = editedAt;
    }
  }

  res.status(200).json(
    successHandler({
      ...business,
      email,
      last_edited_at: lastEditedAt,
      email_status: emailStatus,
      is_claimed: isClaimed,
      is_featured: isFeatured,
      owner_uid: ownerUid,
      has_duplicate_email: isShared,
    })
  );
};

// ! DEPRECATED
// export const getStateBusinesses = async (req, res) => {
//   const { state_id } = req.params;
//   const { page, limit } = req.query;
//   let formattedPage = Number(page);
//   const formattedLimit = Number(limit);
//   let count = 0;

//   // Get Cached Count of Businesses by State Data
//   const { key: countKey, interval: countInterval } =
//     getCountBusinessesByStateKey(state_id);
//   const cachedCountData = await getCacheData(countKey);
//   if (cachedCountData) {
//     count = cachedCountData.data;
//   } else {
//     // Get Count of Businesses by State
//     const { count: countData, error: countError } =
//       await countBusinessesByState(state_id);
//     if (countError) {
//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching count of businesses by state (${state_id}).`,
//             countError
//           )
//         );
//     }

//     count = countData;
//     await cacheData(countKey, countInterval, count);
//   }

//   // Check Page
//   const totalPages = Math.ceil(count / formattedLimit);
//   if (formattedPage > totalPages) {
//     formattedPage = totalPages;
//   }

// };

// ! DEPRECATED
// export const getCityBusinesses = async (req, res) => {
//   const { city_slug, state_id } = req.params;
//   const { page, limit } = req.query;
//   let formattedPage = Number(page);
//   const formattedLimit = Number(limit);
//   let count = 0;
//   let city_id = null;
//   let cityData = null;

//   // Get Cached City Data
//   const { key: cityKey, interval: cityInterval } = getCityBySlugKey(
//     city_slug,
//     state_id
//   );
//   const cachedCityData = await getCacheData(cityKey);
//   if (cachedCityData) {
//     city_id = cachedCityData.data.id;
//     cityData = cachedCityData.data;
//   } else {
//     // Get City ID
//     const { data: cityDBData, error: cityError } = await getCityBySlug(
//       city_slug,
//       state_id
//     );
//     if (cityError) {
//       if (cityError.code === "PGRST116") {
//         return res
//           .status(404)
//           .json(
//             customErrorHandler(
//               SUPABASE_ERROR,
//               `City by slug (${city_slug}) in state (${state_id}) not found.`,
//               cityError
//             )
//           );
//       }

//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching city by slug (${city_slug}) in state (${state_id}).`,
//             cityError
//           )
//         );
//     }

//     city_id = cityDBData.id;
//     cityData = cityDBData;
//     await cacheData(cityKey, cityInterval, cityDBData);
//   }

//   // Get Cached Count of Businesses by City Data
//   const { key: countKey, interval: countInterval } =
//     getCountBusinessesByCityKey(city_id, state_id);
//   const cachedCountData = await getCacheData(countKey);
//   if (cachedCountData) {
//     count = cachedCountData.data;
//   } else {
//     // Get Count of Businesses by City
//     const { count: countData, error: countError } = await countBusinessesByCity(
//       city_id,
//       state_id
//     );
//     if (countError) {
//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching count of businesses by city (${city_id}).`,
//             countError
//           )
//         );
//     }

//     count = countData;
//     await cacheData(countKey, countInterval, count);
//   }

//   // Check Page
//   const totalPages = Math.ceil(count / formattedLimit);
//   if (formattedPage > totalPages) {
//     formattedPage = totalPages;
//   }

//   // Get Cached Businesses by City Data
//   const { key, interval } = getBusinessesByCityKey(
//     city_id,
//     state_id,
//     formattedPage,
//     formattedLimit
//   );
//   const cachedData = await getCacheData(key);
//   if (cachedData) {
//     return res.status(200).json(successHandler(cachedData.data));
//   }

//   // Get Businesses by City
//   const { data, error } = await getBusinessesByCity(
//     city_id,
//     state_id,
//     formattedPage,
//     formattedLimit
//   );
//   if (error) {
//     return res
//       .status(500)
//       .json(
//         customErrorHandler(
//           SUPABASE_ERROR,
//           `There was an error fetching businesses by city (${city_id}).`,
//           error
//         )
//       );
//   }

//   if (data.length === 0) {
//     return res.status(200).json(
//       successHandler({
//         businesses: [],
//         requestTotal: 0,
//         totalBusinesses: 0,
//         totalPages: 0,
//         page: formattedPage,
//         limit: formattedLimit,
//       })
//     );
//   }

//   // Cache Data
//   const compiledData = {
//     businesses: data,
//     requestTotal: data.length,
//     totalBusinesses: count,
//     totalPages,
//     page: formattedPage,
//     limit: formattedLimit,
//     city: {
//       id: city_id,
//       name: cityData.name,
//       slug: cityData.slug,
//       state_id: cityData.state_id,
//     },
//     state: cityData.state,
//   };

//   // Cache Data
//   await cacheData(key, interval, compiledData);
//   res.status(200).json(successHandler(compiledData));
// };

export const getSearchedBusinesses = async (req, res) => {
  const { page, limit } = req.query;
  const sort_option =
    Number(req.body.sort_option) === 6 ? 5 : req.body.sort_option;
  let formattedPage = Number(page);
  const formattedLimit = Number(limit);
  let count = 0;
  let totalPages = 0;

  // All Possible Search Parameters
  const searchParamKeys = [
    { key: "title", filter: "ilike" },
    { key: "state_id", filter: "eq" },
    { key: "city_id", filter: "eq" },
    { key: "postal_code_id", filter: "eq" },
    { key: "total_score", filter: "gte" },
    { key: "reviews_count", filter: "gte" },
    { key: "primary_category_id", filter: "eq" },
  ];

  // Adding features
  if (req.body.features && Object.keys(req.body.features).length > 0) {
    Object.keys(req.body.features).forEach((featureKey) => {
      searchParamKeys.push({ key: `features.${featureKey}`, filter: "eq" });
    });
  }

  // Search Parameters
  const searchParamValues = [];

  // Adding Open Filter
  if (req.body.open) {
    const openFilter = req.body.open;

    // Filter Weekdays and Weekends
    const openDays = [];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekends = ["Saturday", "Sunday"];
    if (openFilter.weekdays) {
      openDays.push(...weekdays);
    }
    if (openFilter.weekends) {
      openDays.push(...weekends);
    }

    if (openDays.length > 0) {
      searchParamValues.push({
        key: "hours.day_of_week",
        filter: "in",
        value: openDays,
      });
      searchParamValues.push({
        key: "hours.is_closed",
        filter: "eq",
        value: false,
      });
    }
  }

  // Get Search Parameters that were sent
  searchParamKeys.forEach((param) => {
    let key = param.key;
    const value = getNestedValue(req.body, key);

    // Add to Search Parameters
    if (value) {
      searchParamValues.push({
        key,
        value,
        filter: param.filter,
      });
    }
  });

  // Adding Secondary Categories
  if (
    req.body.secondary_categories &&
    req.body.secondary_categories.length > 0
  ) {
    searchParamValues.push({
      key: `secondary_categories.secondary_category_id`,
      value: req.body.secondary_categories,
      filter: "in",
    });
  }

  // Get Cached Count of Searched Businesses
  const { key: countKey, interval: countInterval } =
    getCountBusinessesBySearchKey(searchParamValues, sort_option);
  const cachedCountData = await getCacheData(countKey);
  if (cachedCountData) {
    count = cachedCountData.data;

    totalPages = Math.ceil(count / formattedLimit);
    if (totalPages > 0 && formattedPage > totalPages) {
      formattedPage = totalPages;
    }
  }

  // Get Cached Data
  const { key, interval } = getSearchedBusinessesKey(
    searchParamValues,
    formattedPage,
    formattedLimit,
    sort_option
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Searched Businesses
  const {
    data,
    count: countData,
    error,
  } = await searchBusinesses(
    searchParamValues,
    formattedPage,
    formattedLimit,
    sort_option
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error searching businesses.",
          error
        )
      );
  }

  if (data.length === 0) {
    return res.status(200).json(
      successHandler({
        businesses: [],
        requestTotal: 0,
        totalBusinesses: 0,
        totalPages: 0,
        page: formattedPage,
        limit: formattedLimit,
        sort_option,
      })
    );
  }

  // Set Total Pages
  totalPages = Math.ceil(countData / formattedLimit);

  // Compile Data
  const compiledData = {
    businesses: data,
    requestTotal: data.length,
    totalBusinesses: countData,
    totalPages,
    page: formattedPage,
    limit: formattedLimit,
    sort_option,
  };

  // Cache Count
  await cacheData(countKey, countInterval, countData);

  // Cache Data
  await cacheData(key, interval, compiledData);
  res.status(200).json(successHandler(compiledData));
};

const requireOwnedListing = async (req, res, businessId) => {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
    return null;
  }

  const { data: profile, error: profileError } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (profileError) {
    res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error verifying business ownership.",
        profileError
      )
    );
    return null;
  }

  if (!profile) {
    res
      .status(403)
      .json(
        customErrorHandler(
          ACCESS_DENIED,
          "You do not own this business listing."
        )
      );
    return null;
  }

  return { ownerUid, accessToken, profile };
};

const invalidateOwnedImageCaches = async (businessId, { primaryChanged }) => {
  const { data: business } = await getBusinessById(businessId);
  if (business) {
    await invalidateBusinessCache(business);
  }
  if (primaryChanged) {
    await deleteCacheDataByPrefix("FEATURED_BUSINESSES");
    await deleteCacheDataByPrefix("SEARCHED_BUSINESSES");
  }
};

const formatOwnerImageRows = (
  rows,
  { isFeatured, imageUrl, hideDefaultImage }
) => {
  const publicImages = selectPublicGalleryImages(rows, {
    isClaimed: true,
    isFeatured,
    imageUrl,
    hideDefaultImage,
  });
  const visibleIds = new Set(publicImages.map((image) => image.image_id));
  const stored = rows.map((row) => ({
    image_id: row.image_id,
    is_primary: Boolean(row.is_primary),
    is_hidden: Boolean(row.is_hidden),
    created_at: row.created_at,
    visible: visibleIds.has(row.image_id),
  }));

  return {
    images: withDefaultListingImage(stored, {
      imageUrl,
      hideDefaultImage,
      includeHiddenDefault: true,
    }),
    limit: getBusinessImageLimit({ isFeatured }),
    visible_count: publicImages.length,
  };
};

const ownerGalleryOptions = (profile, overrides = {}) => ({
  isFeatured: Boolean(profile.is_featured),
  imageUrl: profile.image_url,
  hideDefaultImage: Boolean(profile.hide_default_image),
  ...overrides,
});

const firstQueryValue = (value) =>
  Array.isArray(value) ? value[0] : value;

export const getOwnedBusinessImages = async (req, res) => {
  const businessId = firstQueryValue(req.query.businessId);
  const owned = await requireOwnedListing(req, res, businessId);
  if (!owned) return;

  const { data: rows, error } = await listBusinessImagesByBusinessId(businessId);
  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error loading listing photos.",
        error
      )
    );
  }

  return res.status(200).json(
    successHandler(
      formatOwnerImageRows(rows, ownerGalleryOptions(owned.profile))
    )
  );
};

export const uploadOwnedBusinessImage = async (req, res) => {
  const businessId = req.body.businessId;
  const owned = await requireOwnedListing(req, res, businessId);
  if (!owned) return;

  const file = req.file;
  if (!file?.buffer) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image: "Choose a JPEG, PNG, or WebP image.",
      })
    );
  }

  if (file.size > MAX_OWNER_IMAGE_BYTES) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image: "Image must be 5 MB or smaller.",
      })
    );
  }

  const detectedMime = detectImageMime(file.buffer);
  if (
    !detectedMime ||
    !OWNER_IMAGE_MIME_TYPES.includes(detectedMime) ||
    !OWNER_IMAGE_MIME_TYPES.includes(file.mimetype)
  ) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image: "Use a JPEG, PNG, or WebP image.",
      })
    );
  }

  const { data: existing, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error loading listing photos.",
        listError
      )
    );
  }

  const limit = getBusinessImageLimit({
    isFeatured: Boolean(owned.profile.is_featured),
  });
  if (existing.length >= limit) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image:
          limit === FEATURED_IMAGE_LIMIT
            ? "Featured listings can have up to 10 photos."
            : "Claimed listings can have up to 3 photos. Upgrade to Featured for up to 10.",
      })
    );
  }

  const imageId = crypto.randomUUID();
  const publicId = buildBusinessImagePublicId(businessId, imageId);
  const hasPrimaryRow = existing.some((row) => row.is_primary);
  const hasDefaultSource = Boolean(owned.profile.image_url);
  const isPrimary =
    !hasPrimaryRow && !hasDefaultSource && existing.length === 0;

  try {
    await uploadBufferToCloudflareImages(file.buffer, { publicId });
  } catch (uploadError) {
    return res.status(500).json(
      customErrorHandler(
        SERVER_ERROR,
        "There was an error uploading this photo.",
        uploadError
      )
    );
  }

  const { data: inserted, error: insertError } = await insertOwnedBusinessImage({
    imageId,
    businessId,
    isPrimary,
  });

  if (insertError || !inserted) {
    try {
      await deleteCloudflareImage(publicId);
    } catch {
      // best-effort cleanup
    }
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error saving this photo.",
        insertError
      )
    );
  }

  if (isPrimary) {
    await markOwnedBusinessCdnStored(businessId);
  }

  await touchOwnedBusinessEditedAt(
    businessId,
    owned.ownerUid,
    owned.accessToken
  );
  await invalidateOwnedImageCaches(businessId, { primaryChanged: isPrimary });

  const { data: rows } = await listBusinessImagesByBusinessId(businessId);
  return res.status(201).json(
    successHandler({
      image: inserted,
      ...formatOwnerImageRows(rows ?? [], ownerGalleryOptions(owned.profile)),
    })
  );
};

export const setOwnedBusinessImagePrimaryHandler = async (req, res) => {
  const { businessId, imageId } = req.body;
  const owned = await requireOwnedListing(req, res, businessId);
  if (!owned) return;

  const { data: rows, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error loading listing photos.",
        listError
      )
    );
  }

  const ownerImagePayload = () =>
    formatOwnerImageRows(rows, ownerGalleryOptions(owned.profile));

  if (imageId === DEFAULT_LISTING_IMAGE_ID) {
    if (!owned.profile.image_url) {
      return res
        .status(404)
        .json(customErrorHandler(ROUTE_NOT_FOUND, "That photo could not be found."));
    }

    const hasStoredPrimary = rows.some((row) => row.is_primary);
    if (!hasStoredPrimary && !owned.profile.hide_default_image) {
      return res.status(200).json(successHandler(ownerImagePayload()));
    }

    if (owned.profile.hide_default_image) {
      const { error: unhideError } = await setOwnedBusinessHideDefaultImage(
        businessId,
        false
      );
      if (unhideError) {
        return res.status(500).json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error updating the primary photo.",
            unhideError
          )
        );
      }
    }

    if (!hasStoredPrimary) {
      await touchOwnedBusinessEditedAt(
        businessId,
        owned.ownerUid,
        owned.accessToken
      );
      await invalidateOwnedImageCaches(businessId, { primaryChanged: true });

      const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
      return res.status(200).json(
        successHandler(
          formatOwnerImageRows(
            nextRows ?? [],
            ownerGalleryOptions(owned.profile, {
              hideDefaultImage: false,
            })
          )
        )
      );
    }

    const { error: clearError } = await clearOwnedBusinessImagePrimary(businessId);
    if (clearError) {
      return res.status(500).json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating the primary photo.",
          clearError
        )
      );
    }

    await touchOwnedBusinessEditedAt(
      businessId,
      owned.ownerUid,
      owned.accessToken
    );
    await invalidateOwnedImageCaches(businessId, { primaryChanged: true });

    const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
    return res.status(200).json(
      successHandler(
        formatOwnerImageRows(
          nextRows ?? [],
          ownerGalleryOptions(owned.profile, {
            hideDefaultImage: false,
          })
        )
      )
    );
  }

  const current = rows.find((row) => row.image_id === imageId);
  if (!current) {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "That photo could not be found."));
  }

  if (current.is_primary && !current.is_hidden) {
    return res.status(200).json(successHandler(ownerImagePayload()));
  }

  const { data: updated, error: updateError } =
    await setOwnedBusinessImagePrimary({ businessId, imageId });

  if (updateError || !updated) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error updating the primary photo.",
        updateError
      )
    );
  }

  await markOwnedBusinessCdnStored(businessId);

  await touchOwnedBusinessEditedAt(
    businessId,
    owned.ownerUid,
    owned.accessToken
  );
  await invalidateOwnedImageCaches(businessId, { primaryChanged: true });

  const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
  return res.status(200).json(
    successHandler(
      formatOwnerImageRows(
        nextRows ?? [],
        ownerGalleryOptions(owned.profile)
      )
    )
  );
};

export const deleteOwnedBusinessImageHandler = async (req, res) => {
  const { businessId, imageId } = req.body;
  const owned = await requireOwnedListing(req, res, businessId);
  if (!owned) return;

  const { data: rows, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error loading listing photos.",
        listError
      )
    );
  }

  const current = rows.find((row) => row.image_id === imageId);
  if (!current) {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "That photo could not be found."));
  }

  const hasDefaultSource = Boolean(owned.profile.image_url);
  if (rows.length <= 1 && !hasDefaultSource) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image: "Upload a replacement photo before removing the last image.",
      })
    );
  }

  let promoted = null;
  if (current.is_primary) {
    promoted =
      rows
        .filter((row) => row.image_id !== imageId)
        .slice()
        .sort((a, b) => {
          const aTime = Date.parse(a.created_at || "") || 0;
          const bTime = Date.parse(b.created_at || "") || 0;
          return aTime - bTime;
        })[0] || null;

    if (promoted) {
      const { error: promoteError } = await setOwnedBusinessImagePrimary({
        businessId,
        imageId: promoted.image_id,
      });
      if (promoteError) {
        return res.status(500).json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error updating the primary photo.",
            promoteError
          )
        );
      }
    }
  }

  const { data: removed, error: deleteError } =
    await deleteOwnedBusinessImageRow({ businessId, imageId });

  if (deleteError || !removed) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error removing this photo.",
        deleteError
      )
    );
  }

  try {
    await deleteCloudflareImage(
      buildBusinessImagePublicId(businessId, imageId)
    );
  } catch {
    // listing row is gone; CF cleanup is best-effort
  }

  await touchOwnedBusinessEditedAt(
    businessId,
    owned.ownerUid,
    owned.accessToken
  );
  await invalidateOwnedImageCaches(businessId, {
    primaryChanged: Boolean(current.is_primary),
  });

  const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
  return res.status(200).json(
    successHandler(
      formatOwnerImageRows(
        nextRows ?? [],
        ownerGalleryOptions(owned.profile)
      )
    )
  );
};

export const setOwnedBusinessImageHiddenHandler = async (req, res) => {
  const { businessId, imageId, isHidden } = req.body;
  const owned = await requireOwnedListing(req, res, businessId);
  if (!owned) return;

  const { data: rows, error: listError } =
    await listBusinessImagesByBusinessId(businessId);
  if (listError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error loading listing photos.",
        listError
      )
    );
  }

  const ownerImagePayload = (overrides) =>
    formatOwnerImageRows(rows, ownerGalleryOptions(owned.profile, overrides));

  if (imageId === DEFAULT_LISTING_IMAGE_ID) {
    if (!owned.profile.image_url) {
      return res
        .status(404)
        .json(customErrorHandler(ROUTE_NOT_FOUND, "That photo could not be found."));
    }

    if (Boolean(owned.profile.hide_default_image) === Boolean(isHidden)) {
      return res.status(200).json(successHandler(ownerImagePayload()));
    }

    const defaultIsPrimary = !rows.some((row) => row.is_primary);
    if (isHidden && defaultIsPrimary) {
      return res.status(422).json(
        customErrorHandler(YUP_ERROR, {
          image:
            "The primary photo cannot be hidden. Set another photo as primary first.",
        })
      );
    }

    const { error: hideError } = await setOwnedBusinessHideDefaultImage(
      businessId,
      isHidden
    );
    if (hideError) {
      return res.status(500).json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating this photo.",
          hideError
        )
      );
    }

    await touchOwnedBusinessEditedAt(
      businessId,
      owned.ownerUid,
      owned.accessToken
    );
    await invalidateOwnedImageCaches(businessId, { primaryChanged: true });

    const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
    return res.status(200).json(
      successHandler(
        formatOwnerImageRows(
          nextRows ?? [],
          ownerGalleryOptions(owned.profile, {
            hideDefaultImage: Boolean(isHidden),
          })
        )
      )
    );
  }

  const current = rows.find((row) => row.image_id === imageId);
  if (!current) {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "That photo could not be found."));
  }

  if (Boolean(current.is_hidden) === Boolean(isHidden)) {
    return res.status(200).json(successHandler(ownerImagePayload()));
  }

  if (isHidden && current.is_primary) {
    return res.status(422).json(
      customErrorHandler(YUP_ERROR, {
        image:
          "The primary photo cannot be hidden. Set another photo as primary first.",
      })
    );
  }

  const { error: updateError } = await setOwnedBusinessImageHidden({
    businessId,
    imageId,
    isHidden,
  });

  if (updateError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error updating this photo.",
        updateError
      )
    );
  }

  await touchOwnedBusinessEditedAt(
    businessId,
    owned.ownerUid,
    owned.accessToken
  );
  await invalidateOwnedImageCaches(businessId, { primaryChanged: false });

  const { data: nextRows } = await listBusinessImagesByBusinessId(businessId);
  return res.status(200).json(
    successHandler(
      formatOwnerImageRows(
        nextRows ?? [],
        ownerGalleryOptions(owned.profile)
      )
    )
  );
};
