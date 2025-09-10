import { Router } from "express";
import {
  getFeaturedBusinesses,
  getBusiness,
  getStateBusinesses,
  getCityBusinesses,
} from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { BusinessIDSchema } from "../schemas/businesses.schemas.js";
import { paginationSchema } from "../schemas/query.schemas.js";
import {
  StateIDSchema,
  StateIDandCitySlugSchema,
} from "../schemas/location.schemas.js";
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
  queryValidator(paginationSchema),
  serverErrorCatcherWrapper(getStateBusinesses)
);

// Get Businesses by City - Query Params: Page, Limit
businessesRouter.get(
  "/state/:state_id/city/:city_slug",
  paramsValidator(StateIDandCitySlugSchema),
  queryValidator(paginationSchema),
  serverErrorCatcherWrapper(getCityBusinesses)
);

export default businessesRouter;
