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
    ? ["CATEGORY:SEARCH_ENGINE", "POSTMAN"]
    : ["CATEGORY:SEARCH_ENGINE"],
});

const rateLimitRule = tokenBucket({
  mode: "LIVE",
  refillRate: 15,
  interval: 30,
  capacity: 150,
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

function isFileUploadRoute(req) {
  if (req.method !== "POST") return false;
  const path = String(req.originalUrl || req.url || "").split("?")[0];
  return (
    path.endsWith("/businesses/images") ||
    path.endsWith("/admin/ingest/groups")
  );
}

export const arcjetMiddleware = async (req, res, next) => {
  const client = isFileUploadRoute(req) ? ajWithoutShield : aj;
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
