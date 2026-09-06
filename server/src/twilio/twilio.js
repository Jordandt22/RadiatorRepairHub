import Twilio from "twilio";

let client = null;

/**
 * Twilio REST client authenticated with an API key (preferred over the
 * account auth token). Returns null when Twilio is not configured so callers
 * can fail closed instead of throwing at import time.
 */
export const twilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_CLIENT_SECRET;

  if (!accountSid || !apiKeySid || !apiKeySecret) return null;

  if (!client) {
    client = Twilio(apiKeySid, apiKeySecret, { accountSid });
  }

  return client;
};

export const isTwilioConfigured = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_API_KEY_SID &&
      process.env.TWILIO_API_KEY_CLIENT_SECRET
  );
