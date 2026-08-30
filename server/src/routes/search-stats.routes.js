import { Router } from "express";
import { createSearchStatEvent } from "../controllers/search-stats.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateSearchStatEventSchema } from "../schemas/search-stats.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const searchStatsRouter = Router();

searchStatsRouter.post(
  "/events",
  bodyValidator(CreateSearchStatEventSchema),
  serverErrorCatcherWrapper(createSearchStatEvent)
);

export default searchStatsRouter;
