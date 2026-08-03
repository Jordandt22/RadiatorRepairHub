import { logger } from "../lib/logger.js";

export const errorCodes = {
  // Server & Validation
  SERVER_ERROR: "server-error",
  YUP_ERROR: "form-error",
  TOO_MANY_REQUESTS: "too-many-requests",
  BOTS_DETECTED: "bots-detected",
  ACCESS_DENIED: "access-denied",
  ROUTE_NOT_FOUND: "route-not-found",
  CLAIM_UNAVAILABLE: "claim-unavailable",
  NO_ACCESS_TOKEN: "no-access-token",
  USER_NOT_FOUND: "user-not-found",
  INVALID_ACCESS_TOKEN: "invalid-access-token",

  // Supabase
  SUPABASE_ERROR: "supabase-error",
};

export const customErrorHandler = (code, message, error) => {
  logger.error(
    {
      code,
      err: error
        ? {
            message: error.message ?? String(error),
            code: error.code,
            details: error.details,
          }
        : undefined,
    },
    message
  );

  return {
    data: null,
    error: {
      code,
      message,
    },
  };
};

export const claimUnavailableHandler = (message, business = null) => {
  logger.error({ code: errorCodes.CLAIM_UNAVAILABLE }, message);
  return {
    data: business?.slug ? { slug: business.slug } : null,
    error: {
      code: errorCodes.CLAIM_UNAVAILABLE,
      message,
      slug: business?.slug ?? null,
    },
  };
};

export const successHandler = (data) => {
  return {
    data,
    error: null,
  };
};
