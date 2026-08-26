import { Router } from "express";
import { handleStripeWebhook } from "../controllers/stripeWebhook.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  "/stripe",
  serverErrorCatcherWrapper(handleStripeWebhook)
);

export default stripeWebhookRouter;
