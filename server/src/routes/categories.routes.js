import { Router } from "express";
import { getPrimaryCategories, getSecondaryCategories } from "../controllers/categories.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";

const categoriesRouter = Router();

// Get Primary Categories
categoriesRouter.get(
  "/primary",
  serverErrorCatcherWrapper(getPrimaryCategories)
);

// Get Secondary Categories
categoriesRouter.get(
  "/secondary",
  serverErrorCatcherWrapper(getSecondaryCategories)
);

export default categoriesRouter;
