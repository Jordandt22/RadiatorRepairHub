import { Router } from "express";
import {
  getFeaturedBusinesses,
  getBusiness,
} from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { BusinessIDSchema } from "../schemas/businesses.schemas.js";
import { paramsValidator } from "../middleware/validators.js";

const businessesRouter = Router();

// Get Featured Businesses
businessesRouter.get(
  "/featured",
  serverErrorCatcherWrapper(getFeaturedBusinesses)
);

// Get Business by ID
businessesRouter.get(
  "/:business_id",
  paramsValidator(BusinessIDSchema),
  serverErrorCatcherWrapper(getBusiness)
);

export default businessesRouter;
