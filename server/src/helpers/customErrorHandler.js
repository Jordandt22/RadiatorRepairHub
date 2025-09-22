export const errorCodes = {
  // Server & Validation
  SERVER_ERROR: "server-error",
  YUP_ERROR: "form-error",
  TOO_MANY_REQUESTS: "too-many-requests",
  BOTS_DETECTED: "bots-detected",
  ACCESS_DENIED: "access-denied",
  ROUTE_NOT_FOUND: "route-not-found",

  // Supabase
  SUPABASE_ERROR: "supabase-error",
};

export const customErrorHandler = (code, message, error) => {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  console.error(`${code}:`);
  console.log(message);

  return {
    data: null,
    error: {
      code,
      message,
    },
  };
};

export const successHandler = (data) => {
  return {
    data,
    error: null,
  };
};
