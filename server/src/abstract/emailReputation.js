const EMAIL_REPUTATION_URL = "https://emailreputation.abstractapi.com/v1/";

/**
 * Verify an email via Abstract Email Reputation API.
 * @see https://docs.abstractapi.com/api/email-reputation
 */
export async function verifyEmailReputation(email) {
  const apiKey = process.env.ABSTRACT_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: {
        type: "config",
        message: "Email verification is not configured.",
      },
    };
  }

  const url = new URL(EMAIL_REPUTATION_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("email", email);

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
        message: "Unable to verify email address right now.",
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

    return {
      ok: false,
      error: {
        type: "api",
        status: response.status,
        message: "Unable to verify email address right now.",
        cause: body,
      },
    };
  }

  const data = await response.json();
  const deliverability = data?.email_deliverability ?? {};
  const status = deliverability.status;
  const isFormatValid = deliverability.is_format_valid === true;
  const isDeliverable = status === "deliverable";

  if (!isFormatValid || !isDeliverable) {
    const suggestedCorrection =
      typeof data?.suggested_correction === "string" &&
      data.suggested_correction.trim()
        ? data.suggested_correction.trim()
        : null;

    return {
      ok: false,
      error: {
        type: "undeliverable",
        status: status ?? "undeliverable",
        statusDetail: deliverability.status_detail ?? null,
        suggestedCorrection,
        message: suggestedCorrection
          ? `This email address cannot receive messages. Did you mean ${suggestedCorrection}?`
          : "Please enter a valid email address that can receive messages.",
      },
    };
  }

  return { ok: true, data };
}
