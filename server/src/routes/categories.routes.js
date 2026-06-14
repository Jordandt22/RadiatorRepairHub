import { Router } from "express";
import {
  getPrimaryCategories,
  getPrimaryCategoryBySlugHandler,
  getSecondaryCategories,
} from "../controllers/categories.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { paramsValidator } from "../middleware/validators.js";
import { CategorySlugSchema } from "../schemas/categories.schemas.js";

const categoriesRouter = Router();

categoriesRouter.get(
  "/primary/slug/:slug",
  paramsValidator(CategorySlugSchema),
  serverErrorCatcherWrapper(getPrimaryCategoryBySlugHandler)
);

categoriesRouter.get(
  "/primary",
  serverErrorCatcherWrapper(getPrimaryCategories)
);

categoriesRouter.get(
  "/secondary",
  serverErrorCatcherWrapper(getSecondaryCategories)
);

export default categoriesRouter;
