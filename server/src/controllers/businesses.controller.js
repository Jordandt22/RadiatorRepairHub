import {
  errorCodes,
  customErrorHandler,
  successHandler,
  claimUnavailableHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getFeaturedBusinessesKey,
  getCacheData,
  getBusinessBySlugKey,
  getBusinessSlugsForSitemapKey,
  getSearchedBusinessesKey,
  getCountBusinessesBySearchKey,
  getClaimRequestCodeKey,
  getBusinessByIdKey,
  setWithExactTtl,
  deleteCacheData,
} from "../redis/redis.js";
import {
  getTopRatedBusinesses,
  searchBusinesses,
  getBusinessBySlug,
  getBusinessSlugsForSitemap,
  getBusinessClaimInfo,
  insertClaimRequest,
  updateClaimRequestStatus,
  getClaimRequestWithBusiness,
  deleteClaimRequest,
  completeBusinessClaimRpc,
  createAuthUser,
  deleteAuthUser,
  resetClaimAttempts,
  incrementClaimAttempts,
} from "../supabase/supabase.functions.js";
import { getNestedValue } from "../lib/util.js";
import { resendClient } from "../resend/resend.js";
import {
  CLAIM_VERIFICATION_MESSAGE,
  SENDER_NAME,
  buildClaimVerifyLink,
  buildBusinessClaimLink,
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
  if (!business?.id) return;
  const { key: businessIdCacheKey } = getBusinessByIdKey(business.id);
  await deleteCacheData(businessIdCacheKey);
  if (business.slug) {
    const { key: businessSlugCacheKey } = getBusinessBySlugKey(business.slug);
    await deleteCacheData(businessSlugCacheKey);
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
  const { key: codeKey } = getClaimRequestCodeKey(claimRequestId);

  const { error: deleteError } = await deleteClaimRequest(claimRequestId);
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
      .status(authError?.message?.toLowerCase?.().includes("already") ? 409 : 500)
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

  const uid = authData.user.id;
  const { error: rpcError } = await completeBusinessClaimRpc(
    claimRequestId,
    business.id,
    uid
  );

  if (rpcError) {
    try {
      await deleteAuthUser(uid);
    } catch {
      // best-effort cleanup
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

  await invalidateBusinessCache(business);

  return res.status(201).json(
    successHandler({
      slug: business.slug,
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

export const getFeaturedBusinesses = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getFeaturedBusinessesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Top 10 Rated Businesses
  const { data, error } = await getTopRatedBusinesses();
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

  // Cache Data
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
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

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

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
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
  const { sort_option } = req.body;
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
