import { Router } from "express";
import { createListingRequest } from "../controllers/listing-requests.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateListingRequestSchema } from "../schemas/listing-requests.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const listingRequestsRouter = Router();

listingRequestsRouter.post(
  "/",
  bodyValidator(CreateListingRequestSchema),
  serverErrorCatcherWrapper(createListingRequest)
);

export default listingRequestsRouter;
