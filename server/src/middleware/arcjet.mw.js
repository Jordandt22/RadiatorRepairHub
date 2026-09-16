import arcjet from "@arcjet/node";
import { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";

const isDev = process.env.NODE_ENV === "development";
const shieldMode = isDev ? "DRY_RUN" : "LIVE";

const botRule = detectBot({
  mode: "LIVE",
  allow: isDev
    ? [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "META_CRAWLER",
        "POSTMAN",
      ]
    : ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "META_CRAWLER"],
});

const rateLimitRule = tokenBucket({
  mode: "LIVE",
  // Raised for Vercel SSR bursts (many directory pages share a few egress IPs).
  refillRate: 40,
  interval: 30,
  capacity: 600,
});

const characteristics = ["ip.src"];

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics,
  rules: [shield({ mode: shieldMode }), botRule, rateLimitRule],
});

// File bodies make Shield false-positive. Bot + rate limit still apply.
const ajWithoutShield = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics,
  rules: [botRule, rateLimitRule],
});

// Next.js SSR on Vercel shares egress IPs — rate-limiting them like browsers
// denies legitimate directory renders under crawl. Bot + Shield still apply.
const ajVercelSsr = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics,
  rules: [shield({ mode: shieldMode }), botRule],
});

const ajVercelSsrWithoutShield = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics,
  rules: [botRule],
});

function isFileUploadRoute(req) {
  if (req.method !== "POST") return false;
  const path = String(req.originalUrl || req.url || "").split("?")[0];
  return (
    path.endsWith("/businesses/images") ||
    path.endsWith("/admin/ingest/groups")
  );
}

function isVercelSsrRequest(req) {
  const vercelId = req.get("x-vercel-id");
  return Boolean(vercelId && String(vercelId).trim());
}

export const arcjetMiddleware = async (req, res, next) => {
  const fileUpload = isFileUploadRoute(req);
  const vercelSsr = isVercelSsrRequest(req);
  const client = vercelSsr
    ? fileUpload
      ? ajVercelSsrWithoutShield
      : ajVercelSsr
    : fileUpload
      ? ajWithoutShield
      : aj;
  const decision = await client.protect(req, { requested: 1 });

  if (isDev) {
    console.log(
      `Arcjet Decision: ${decision.conclusion} - [${decision.reason.type}]`
    );
  }

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res
        .status(429)
        .json(
          customErrorHandler(
            errorCodes.TOO_MANY_REQUESTS,
            "Too many requests have been sent. Please try again later."
          )
        );
    } else if (decision.reason.isBot()) {
      return res
        .status(403)
        .json(
          customErrorHandler(
            errorCodes.BOTS_DETECTED,
            "Bots Detected. Please refrain from using bots to access our API."
          )
        );
    } else {
      return res
        .status(403)
        .json(
          customErrorHandler(
            errorCodes.ACCESS_DENIED,
            "Your access has been denied."
          )
        );
    }
  } else if (decision.results.some(isSpoofedBot)) {
    return res
      .status(403)
      .json(
        customErrorHandler(
          errorCodes.ACCESS_DENIED,
          "Your access has been denied."
        )
      );
  }

  next();
};
