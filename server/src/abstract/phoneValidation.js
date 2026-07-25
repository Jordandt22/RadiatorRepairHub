const PHONE_INTELLIGENCE_URL = "https://phoneintelligence.abstractapi.com/v1/";

/**
 * Verify a phone number via Abstract Phone Intelligence API.
 * @see https://docs.abstractapi.com/api/phone-intelligence
 */
export async function verifyPhoneNumber(phone, { country = "US" } = {}) {
  const apiKey = process.env.ABSTRACT_API_PHONE_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: {
        type: "config",
        message: "Phone verification is not configured.",
      },
    };
  }

  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return {
      ok: false,
      error: {
        type: "invalid",
        message: "Please enter a valid phone number.",
      },
    };
  }

  const url = new URL(PHONE_INTELLIGENCE_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("phone", digits);
  if (country) {
    url.searchParams.set("country", country);
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    return {
      ok: false,
      error: {
        type: "network",
        message: "Unable to verify phone number right now.",
        cause: error,
      },
    };
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const quotaMessage =
      response.status === 422
        ? "Phone verification quota reached. Please try again later."
        : response.status === 429
          ? "Too many phone verification requests. Please wait and try again."
          : "Unable to verify phone number right now.";

    return {
      ok: false,
      error: {
        type: "api",
        status: response.status,
        message: quotaMessage,
        cause: body,
      },
    };
  }

  const data = await response.json();
  const isValid = data?.phone_validation?.is_valid === true;

  if (!isValid) {
    return {
      ok: false,
      error: {
        type: "invalid",
        message: "Please enter a valid phone number.",
        cause: data,
      },
    };
  }

  return { ok: true, data };
}
