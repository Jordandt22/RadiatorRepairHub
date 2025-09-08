import { Router } from "express";
import { getStates, getCities, getPostalCodes } from "../controllers/location.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { paramsValidator } from "../middleware/validators.js";
import { StateIDSchema, CityIDSchema } from "../schemas/location.schemas.js";

const locationRouter = Router();

// Get States
locationRouter.get("/states", serverErrorCatcherWrapper(getStates));

// Get Cities
locationRouter.get(
  "/states/:state_id/cities",
  paramsValidator(StateIDSchema),
  serverErrorCatcherWrapper(getCities)
);

// Get Postal Codes
locationRouter.get(
  "/cities/:city_id/postal-codes",
  paramsValidator(CityIDSchema),
  serverErrorCatcherWrapper(getPostalCodes)
);

export default locationRouter;
