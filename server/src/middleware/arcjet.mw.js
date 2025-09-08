import arcjet from "@arcjet/node";
import { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import {
  errorCodes,
  customErrorHandler,
} from "../helpers/customErrorHandler.js";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow:
        process.env.NODE_ENV === "development"
          ? ["CATEGORY:SEARCH_ENGINE", "POSTMAN"]
          : ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 15, // Refill tokens per interval
      interval: 30, // Seconds Interval
      capacity: 150, // Bucket tokens capacity
    }),
  ],
});

export const arcjetMiddleware = async (req, res, next) => {
  const decision = await aj.protect(req, { requested: 1 });
  if (process.env.NODE_ENV === "development")
    console.log(
      `Arcjet Decision: ${decision.conclusion} - [${decision.reason.type}]`
    );

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
