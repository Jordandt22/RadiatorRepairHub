import { createHmac, timingSafeEqual } from "node:crypto";

const WEEKLY_DIGEST_TYPE = "weekly_digest";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365;

function getUnsubscribeSecret() {
  return (
    process.env.UNSUBSCRIBE_TOKEN_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded) {
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}

function signEncoded(encoded) {
  const secret = getUnsubscribeSecret();
  if (!secret) {
    throw new Error("Unsubscribe token secret is not configured.");
  }
  return createHmac("sha256", secret).update(encoded).digest("base64url");
}

export function signUnsubscribeToken({
  businessId,
  email,
  type = WEEKLY_DIGEST_TYPE,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  now = Date.now(),
}) {
  const payload = {
    businessId,
    email: String(email || "").trim().toLowerCase(),
    type,
    exp: Math.floor(now / 1000) + ttlSeconds,
  };
  const encoded = encodePayload(payload);
  return `${encoded}.${signEncoded(encoded)}`;
}

export function verifyUnsubscribeToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "invalid_token" };
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return { ok: false, reason: "invalid_token" };
  }

  let expected;
  try {
    expected = signEncoded(encoded);
  } catch {
    return { ok: false, reason: "secret_missing" };
  }

  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return { ok: false, reason: "invalid_signature" };
  }

  let payload;
  try {
    payload = decodePayload(encoded);
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }

  if (
    !payload?.businessId ||
    !payload?.email ||
    payload.type !== WEEKLY_DIGEST_TYPE
  ) {
    return { ok: false, reason: "invalid_payload" };
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    payload: {
      businessId: payload.businessId,
      email: String(payload.email).trim().toLowerCase(),
      type: payload.type,
    },
  };
}

export function buildUnsubscribeUrl(token, webBaseUrl) {
  const base = String(webBaseUrl || "").replace(/\/$/, "");
  return `${base}/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function buildOneClickUnsubscribeUrl(token, webBaseUrl) {
  const base = String(webBaseUrl || "").replace(/\/$/, "");
  return `${base}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}
