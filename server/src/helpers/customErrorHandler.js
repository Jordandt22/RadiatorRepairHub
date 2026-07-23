export const errorCodes = {
  // Server & Validation
  SERVER_ERROR: "server-error",
  YUP_ERROR: "form-error",
  TOO_MANY_REQUESTS: "too-many-requests",
  BOTS_DETECTED: "bots-detected",
  ACCESS_DENIED: "access-denied",
  ROUTE_NOT_FOUND: "route-not-found",
  CLAIM_UNAVAILABLE: "claim-unavailable",

  // Supabase
  SUPABASE_ERROR: "supabase-error",
};

export const customErrorHandler = (code, message, error) => {
  console.error(`${code}: ${message}`);
  if (error) {
    console.error(
      error.message ?? error,
      error.code ? `(code: ${error.code})` : "",
      error.details ? `details: ${error.details}` : "",
    );
  }

  return {
    data: null,
    error: {
      code,
      message,
    },
  };
};

export const claimUnavailableHandler = (message, business = null) => {
  console.error(`claim-unavailable: ${message}`);
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
