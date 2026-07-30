import { Router } from "express";
import { createListingReport } from "../controllers/listing-reports.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateListingReportSchema } from "../schemas/listing-reports.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const listingReportsRouter = Router();

listingReportsRouter.post(
  "/",
  bodyValidator(CreateListingReportSchema),
  serverErrorCatcherWrapper(createListingReport)
);

export default listingReportsRouter;
