import { twilioClient } from "./twilio.js";

/**
 * Twilio Verify (Voice channel). Twilio generates, stores, and validates the
 * code, so no Redis code is used for phone claims.
 * @see https://www.twilio.com/docs/verify/authentication-channels#voice
 */
const verifyService = () => {
  const client = twilioClient();
  const serviceSid = process.env.TWILIO_VERIFY_VOICE_SERVICE_SID;

  if (!client || !serviceSid) return null;

  return client.verify.v2.services(serviceSid);
};

const configError = {
  ok: false,
  error: {
    type: "config",
    message: "Phone verification is not configured.",
  },
};

/** Place an automated verification call that reads a one-time code. */
export async function startVoiceVerification(phoneE164) {
  const service = verifyService();
  if (!service) return configError;

  try {
    const verification = await service.verifications.create({
      to: phoneE164,
      channel: "call",
    });

    return { ok: true, data: verification };
  } catch (error) {
    return {
      ok: false,
      error: {
        type: "api",
        status: error?.status ?? null,
        code: error?.code ?? null,
        message: "Unable to place the verification call right now.",
        cause: error,
      },
    };
  }
}

/**
 * Check a code the caller entered. `approved` means Twilio confirmed the code
 * for that phone number.
 */
export async function checkVoiceVerification(phoneE164, code) {
  const service = verifyService();
  if (!service) return configError;

  try {
    const check = await service.verificationChecks.create({
      to: phoneE164,
      code,
    });

    return { ok: true, approved: check?.status === "approved", data: check };
  } catch (error) {
    // Twilio 404s once a verification is expired, already approved, or has hit
    // its own max attempts. Treat it as an incorrect/expired code.
    if (error?.status === 404) {
      return {
        ok: true,
        approved: false,
        expired: true,
        data: null,
      };
    }

    return {
      ok: false,
      error: {
        type: "api",
        status: error?.status ?? null,
        code: error?.code ?? null,
        message: "Unable to check the verification code right now.",
        cause: error,
      },
    };
  }
}
