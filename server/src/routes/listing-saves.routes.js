import { Router } from "express";
import { createListingSave } from "../controllers/listing-saves.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { CreateListingSaveSchema } from "../schemas/listing-saves.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const listingSavesRouter = Router();

listingSavesRouter.post(
  "/",
  bodyValidator(CreateListingSaveSchema),
  serverErrorCatcherWrapper(createListingSave)
);

export default listingSavesRouter;
