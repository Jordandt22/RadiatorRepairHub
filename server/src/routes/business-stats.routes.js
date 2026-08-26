import { Router } from "express";
import { createBusinessStatEvent } from "../controllers/business-stats.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateBusinessStatEventSchema } from "../schemas/business-stats.schemas.js";
import { bodyValidator } from "../middleware/validators.js";
import { optionalAuthUser } from "../middleware/auth.mw.js";

const businessStatsRouter = Router();

businessStatsRouter.post(
  "/events",
  optionalAuthUser,
  bodyValidator(CreateBusinessStatEventSchema),
  serverErrorCatcherWrapper(createBusinessStatEvent)
);

export default businessStatsRouter;
