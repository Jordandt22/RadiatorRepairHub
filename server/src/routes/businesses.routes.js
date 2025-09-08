import { Router } from "express";
import { getFeaturedBusinesses } from "../controllers/businesses.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const businessesRouter = Router();

// Get Featured Businesses
businessesRouter.get(
  "/featured",
  serverErrorCatcherWrapper(getFeaturedBusinesses)
);

// Search Businesses

// Get Business by ID


export default businessesRouter;
