import { Router } from "express";
import {
  getStates,
  getAllCitiesHandler,
  getCities,
  getCityBySlugHandler,
  getPostalCodes,
  getPostalCodesByStateHandler,
} from "../controllers/location.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { paramsValidator } from "../middleware/validators.js";
import {
  StateIDSchema,
  CityIDSchema,
  StateIDandCitySlugSchema,
} from "../schemas/location.schemas.js";

const locationRouter = Router();

// Get States
locationRouter.get("/states", serverErrorCatcherWrapper(getStates));

// Get All Cities
locationRouter.get("/cities", serverErrorCatcherWrapper(getAllCitiesHandler));

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
