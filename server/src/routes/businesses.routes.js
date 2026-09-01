import { Router } from "express";
import multer from "multer";
import {
  customErrorHandler,
  errorCodes,
} from "../helpers/customErrorHandler.js";
import { MAX_OWNER_IMAGE_BYTES } from "../lib/businessImages.js";
import {
  getFeaturedBusinesses,
  getTopVerifiedBusinessesHandler,
  getBusiness,
  getSearchedBusinesses,
  getBusinessSlugsForSitemapHandler,
  claimBusiness,
  getClaimRequest,
  cancelClaim,
  completeClaim,
  resendClaim,
  getOwnedBusinessesHandler,
  getOwnedBusinessStatsHandler,
  getOwnedCompetitorInsightsHandler,
  unclaimOwnedBusinessHandler,
  updateBusinessContact,
  updateBusinessCategories,
  updateBusinessAmenities,
  updateBusinessAbout,
  updateBusinessHours,
  getOwnedBusinessImages,
  uploadOwnedBusinessImage,
  setOwnedBusinessImagePrimaryHandler,
  setOwnedBusinessImageHiddenHandler,
  deleteOwnedBusinessImageHandler,
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
  OwnedBusinessIdParamsSchema,
  OwnedBusinessStatsQuerySchema,
  UpdateBusinessCategoriesSchema,
  UpdateBusinessAmenitiesSchema,
  UpdateBusinessAboutSchema,
  UpdateBusinessHoursSchema,
  OwnedBusinessImagesQuerySchema,
  UploadBusinessImageSchema,
  UpdateBusinessImagePrimarySchema,
  UpdateBusinessImageHiddenSchema,
  DeleteBusinessImageSchema,
} from "../schemas/businesses.schemas.js";
import { paginationSchema, featuredBusinessesQuerySchema } from "../schemas/query.schemas.js";
import {
  paramsValidator,
  queryValidator,
  bodyValidator,
  bodyValidatorFor,
} from "../middleware/validators.js";
import { expireStaleClaimsOnBusinessFetch } from "../middleware/claim.mw.js";
import { authUser, optionalAuthUser } from "../middleware/auth.mw.js";

const { YUP_ERROR } = errorCodes;

const ownerImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_OWNER_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(
      file.mimetype
    );
    if (!ok) {
      cb(new Error("Use a JPEG, PNG, or WebP image."));
      return;
    }
    cb(null, true);
  },
});

const handleOwnerImageUpload = (req, res, next) => {
  ownerImageUpload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller."
        : err.message || "Unable to upload this image.";
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, { image: message }));
  });
};

const businessesRouter = Router();

// Get Featured Businesses
businessesRouter.get(
  "/featured",
  queryValidator(featuredBusinessesQuerySchema),
  serverErrorCatcherWrapper(getFeaturedBusinesses)
);

// Get Top Verified Businesses (home)
businessesRouter.get(
  "/top-verified",
  serverErrorCatcherWrapper(getTopVerifiedBusinessesHandler)
);

// Owner-owned businesses (must be before /:business_slug)
businessesRouter.get(
  "/owned",
  authUser,
  serverErrorCatcherWrapper(getOwnedBusinessesHandler)
);

businessesRouter.get(
  "/owned/:businessId/stats",
  authUser,
  paramsValidator(OwnedBusinessIdParamsSchema),
  queryValidator(OwnedBusinessStatsQuerySchema),
  serverErrorCatcherWrapper(getOwnedBusinessStatsHandler)
);

businessesRouter.get(
  "/owned/:businessId/competitor-insights",
  authUser,
  paramsValidator(OwnedBusinessIdParamsSchema),
  queryValidator(OwnedBusinessStatsQuerySchema),
  serverErrorCatcherWrapper(getOwnedCompetitorInsightsHandler)
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

// Owner images (must be before /:business_slug)
businessesRouter.get(
  "/images",
  authUser,
  queryValidator(OwnedBusinessImagesQuerySchema),
  serverErrorCatcherWrapper(getOwnedBusinessImages)
);

businessesRouter.post(
  "/images",
  authUser,
  handleOwnerImageUpload,
  bodyValidator(UploadBusinessImageSchema),
  serverErrorCatcherWrapper(uploadOwnedBusinessImage)
);

businessesRouter.patch(
  "/images/primary",
  authUser,
  bodyValidator(UpdateBusinessImagePrimarySchema),
  serverErrorCatcherWrapper(setOwnedBusinessImagePrimaryHandler)
);

businessesRouter.patch(
  "/images/hidden",
  authUser,
  bodyValidator(UpdateBusinessImageHiddenSchema),
  serverErrorCatcherWrapper(setOwnedBusinessImageHiddenHandler)
);

businessesRouter.delete(
  "/images",
  authUser,
  bodyValidator(DeleteBusinessImageSchema),
  serverErrorCatcherWrapper(deleteOwnedBusinessImageHandler)
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
