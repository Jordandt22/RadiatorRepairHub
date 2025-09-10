import { Router } from "express";
import {
  getFeaturedBusinesses,
  getBusiness,
  getStateBusinesses,
} from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  BusinessIDSchema,
  stateBusinessesSchema,
} from "../schemas/businesses.schemas.js";
import { StateIDSchema } from "../schemas/location.schemas.js";
import { paramsValidator, queryValidator } from "../middleware/validators.js";

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

// Get Businesses by State - Query Params: Page, Limit
businessesRouter.get(
  "/state/:state_id",
  paramsValidator(StateIDSchema),
  queryValidator(stateBusinessesSchema),
  serverErrorCatcherWrapper(getStateBusinesses)
);

export default businessesRouter;
