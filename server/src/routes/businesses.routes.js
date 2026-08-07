import { Router } from "express";
import {
  getFeaturedBusinesses,
  getBusiness,
  getSearchedBusinesses,
  getBusinessSlugsForSitemapHandler,
  claimBusiness,
  getClaimRequest,
  cancelClaim,
  completeClaim,
  resendClaim,
  getOwnedBusinessesHandler,
  unclaimOwnedBusinessHandler,
  updateBusinessContact,
  updateBusinessCategories,
  updateBusinessAmenities,
  updateBusinessAbout,
  updateBusinessHours,
} from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  BusinessSlugSchema,
  SearchBusinessesSchema,
  ClaimBusinessSchema,
  ClaimRequestIdSchema,
  CancelClaimSchema,
  CompleteClaimSchema,
  CompleteClaimAuthenticatedSchema,
  UpdateBusinessContactSchema,
  UnclaimOwnedBusinessSchema,
  UpdateBusinessCategoriesSchema,
  UpdateBusinessAmenitiesSchema,
  UpdateBusinessAboutSchema,
  UpdateBusinessHoursSchema,
} from "../schemas/businesses.schemas.js";
import { paginationSchema } from "../schemas/query.schemas.js";
import {
  paramsValidator,
  queryValidator,
  bodyValidator,
  bodyValidatorFor,
} from "../middleware/validators.js";
import { expireStaleClaimsOnBusinessFetch } from "../middleware/claim.mw.js";
import { authUser, optionalAuthUser } from "../middleware/auth.mw.js";

const businessesRouter = Router();

// Get Featured Businesses
businessesRouter.get(
  "/featured",
  serverErrorCatcherWrapper(getFeaturedBusinesses)
);

// Owner-owned businesses (must be before /:business_slug)
businessesRouter.get(
  "/owned",
  authUser,
  serverErrorCatcherWrapper(getOwnedBusinessesHandler)
);

// Owner unclaim (must be before /:business_slug)
businessesRouter.post(
  "/unclaim",
  authUser,
  bodyValidator(UnclaimOwnedBusinessSchema),
  serverErrorCatcherWrapper(unclaimOwnedBusinessHandler)
);

// Owner contact update (must be before /:business_slug)
businessesRouter.patch(
  "/contact",
  authUser,
  bodyValidator(UpdateBusinessContactSchema),
  serverErrorCatcherWrapper(updateBusinessContact)
);

// Owner categories update (must be before /:business_slug)
businessesRouter.patch(
  "/categories",
  authUser,
  bodyValidator(UpdateBusinessCategoriesSchema),
  serverErrorCatcherWrapper(updateBusinessCategories)
);

// Owner amenities update (must be before /:business_slug)
businessesRouter.patch(
  "/amenities",
  authUser,
  bodyValidator(UpdateBusinessAmenitiesSchema),
  serverErrorCatcherWrapper(updateBusinessAmenities)
);

// Owner about update (must be before /:business_slug)
businessesRouter.patch(
  "/about",
  authUser,
  bodyValidator(UpdateBusinessAboutSchema),
  serverErrorCatcherWrapper(updateBusinessAbout)
);

// Owner hours update (must be before /:business_slug)
businessesRouter.patch(
  "/hours",
  authUser,
  bodyValidator(UpdateBusinessHoursSchema),
  serverErrorCatcherWrapper(updateBusinessHours)
);

// Get all business slugs for sitemap generation
businessesRouter.get(
  "/sitemap-slugs",
  serverErrorCatcherWrapper(getBusinessSlugsForSitemapHandler)
);

// Claim routes (must be before /:business_slug)
businessesRouter.post(
  "/claim/verify",
  bodyValidator(ClaimBusinessSchema),
  serverErrorCatcherWrapper(claimBusiness)
);

businessesRouter.post(
  "/claim/cancel",
  bodyValidator(CancelClaimSchema),
  serverErrorCatcherWrapper(cancelClaim)
);

businessesRouter.post(
  "/claim/resend",
  bodyValidator(CancelClaimSchema),
  serverErrorCatcherWrapper(resendClaim)
);

businessesRouter.post(
  "/claim",
  optionalAuthUser,
  bodyValidatorFor((req) =>
    req.user ? CompleteClaimAuthenticatedSchema : CompleteClaimSchema
  ),
  serverErrorCatcherWrapper(completeClaim)
);

businessesRouter.get(
  "/claim/:claim_request_id",
  paramsValidator(ClaimRequestIdSchema),
  serverErrorCatcherWrapper(getClaimRequest)
);

// Get Business by Slug
businessesRouter.get(
  "/:business_slug",
  paramsValidator(BusinessSlugSchema),
  expireStaleClaimsOnBusinessFetch,
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
