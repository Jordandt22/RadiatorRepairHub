import { Router } from "express";
import {
  createCheckoutSession,
  createPortalSession,
  listBillingSubscriptions,
} from "../controllers/billing.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateCheckoutSessionSchema } from "../schemas/billing.schemas.js";
import { bodyValidator } from "../middleware/validators.js";
import { authUser } from "../middleware/auth.mw.js";

const billingRouter = Router();

billingRouter.post(
  "/checkout-session",
  authUser,
  bodyValidator(CreateCheckoutSessionSchema),
  serverErrorCatcherWrapper(createCheckoutSession)
);

billingRouter.post(
  "/portal-session",
  authUser,
  serverErrorCatcherWrapper(createPortalSession)
);

billingRouter.get(
  "/subscriptions",
  authUser,
  serverErrorCatcherWrapper(listBillingSubscriptions)
);

export default billingRouter;
