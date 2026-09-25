import { Router } from "express";
import { getPublicSiteEngagementStats } from "../controllers/site-stats.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const siteStatsRouter = Router();

siteStatsRouter.get(
  "/",
  serverErrorCatcherWrapper(getPublicSiteEngagementStats)
);

export default siteStatsRouter;
