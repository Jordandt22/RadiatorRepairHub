import { Router } from "express";
import {
  getStates,
  getAllCitiesHandler,
  getCitiesCountHandler,
  getCities,
  getCityBySlugHandler,
  getPostalCodes,
  getPostalCodesByStateHandler,
  getStateBusinessCountsHandler,
  getCityBusinessCountsHandler,
  getCitiesForSitemapHandler,
  getCityCategoriesForSitemapHandler,
  getStateCategoriesForSitemapHandler,
  getCityCategoryCountsHandler,
  getStateCategoryCountsHandler,
  getCategoryCityCountsHandler,
  getCategoryStateCountsHandler,
} from "../controllers/location.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { paramsValidator } from "../middleware/validators.js";
import {
  StateIDSchema,
  CityIDSchema,
  StateIDandCitySlugSchema,
  CategoryIDSchema,
} from "../schemas/location.schemas.js";

const locationRouter = Router();

// Get States
locationRouter.get("/states", serverErrorCatcherWrapper(getStates));

locationRouter.get(
  "/states/counts",
  serverErrorCatcherWrapper(getStateBusinessCountsHandler)
);

// Get All Cities
locationRouter.get("/cities", serverErrorCatcherWrapper(getAllCitiesHandler));

locationRouter.get(
  "/cities/count",
  serverErrorCatcherWrapper(getCitiesCountHandler)
);

locationRouter.get(
  "/cities/sitemap",
  serverErrorCatcherWrapper(getCitiesForSitemapHandler)
);

locationRouter.get(
  "/city-categories/sitemap",
  serverErrorCatcherWrapper(getCityCategoriesForSitemapHandler)
);

locationRouter.get(
  "/state-categories/sitemap",
  serverErrorCatcherWrapper(getStateCategoriesForSitemapHandler)
);

locationRouter.get(
  "/cities/:city_id/category-counts",
  paramsValidator(CityIDSchema),
  serverErrorCatcherWrapper(getCityCategoryCountsHandler)
);

locationRouter.get(
  "/states/:state_id/category-counts",
  paramsValidator(StateIDSchema),
  serverErrorCatcherWrapper(getStateCategoryCountsHandler)
);

locationRouter.get(
  "/categories/:category_id/city-counts",
  paramsValidator(CategoryIDSchema),
  serverErrorCatcherWrapper(getCategoryCityCountsHandler)
);

locationRouter.get(
  "/categories/:category_id/state-counts",
  paramsValidator(CategoryIDSchema),
  serverErrorCatcherWrapper(getCategoryStateCountsHandler)
);

locationRouter.get(
  "/states/:state_id/cities/counts",
  paramsValidator(StateIDSchema),
  serverErrorCatcherWrapper(getCityBusinessCountsHandler)
);

// Get Cities by State
locationRouter.get(
  "/states/:state_id/cities",
  paramsValidator(StateIDSchema),
  serverErrorCatcherWrapper(getCities)
);

// Get City by Slug
locationRouter.get(
  "/states/:state_id/cities/slug/:city_slug",
  paramsValidator(StateIDandCitySlugSchema),
  serverErrorCatcherWrapper(getCityBySlugHandler)
);

// Get Postal Codes by City
locationRouter.get(
  "/cities/:city_id/postal-codes",
  paramsValidator(CityIDSchema),
  serverErrorCatcherWrapper(getPostalCodes)
);

// Get Postal Codes by State
locationRouter.get(
  "/states/:state_id/postal-codes",
  paramsValidator(StateIDSchema),
  serverErrorCatcherWrapper(getPostalCodesByStateHandler)
);

export default locationRouter;
