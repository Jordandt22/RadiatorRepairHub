import { Router } from "express";
import {
  getFeaturedBusinesses,
  getBusiness,
  getSearchedBusinesses,
} from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  BusinessSlugSchema,
  SearchBusinessesSchema,
} from "../schemas/businesses.schemas.js";
import { paginationSchema } from "../schemas/query.schemas.js";
import {
  paramsValidator,
  queryValidator,
  bodyValidator,
} from "../middleware/validators.js";

const businessesRouter = Router();

// Get Featured Businesses
businessesRouter.get(
  "/featured",
  serverErrorCatcherWrapper(getFeaturedBusinesses)
);

// Get Business by Slug
businessesRouter.get(
  "/:business_slug",
  paramsValidator(BusinessSlugSchema),
  serverErrorCatcherWrapper(getBusiness)
);

/*
  Search Businesses - Query Params: 
    - Search Params: 
      - Title
      - State ID
      - City Slug
      - Total Score
      - Reviews Count
      - Primary Category
      - Secondary Categories
      - Features
      - Sort Ascending
      - Open: Now, Weekdays, Weekends
    - Pagination Params: Page, Limit
*/
businessesRouter.post(
  "/search",
  queryValidator(paginationSchema),
  bodyValidator(SearchBusinessesSchema),
  serverErrorCatcherWrapper(getSearchedBusinesses)
);

// ! DEPRECATED
// Get Businesses by State - Query Params: Page, Limit *!Deprecated
// businessesRouter.get(
//   "/state/:state_id",
//   paramsValidator(StateIDSchema),
//   queryValidator(paginationSchema),
//   serverErrorCatcherWrapper(getStateBusinesses)
// );

// ! DEPRECATED
// Get Businesses by City - Query Params: Page, Limit *!Deprecated
// businessesRouter.get(
//   "/state/:state_id/city/:city_slug",
//   paramsValidator(StateIDandCitySlugSchema),
//   queryValidator(paginationSchema),
//   serverErrorCatcherWrapper(getCityBusinesses)
// );

export default businessesRouter;
