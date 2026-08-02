import { Router } from "express";
import { getPublicAffiliateProducts } from "../controllers/affiliate-products.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { queryValidator } from "../middleware/validators.js";
import { GetPublicAffiliateProductsQuerySchema } from "../schemas/affiliate-products.schemas.js";

const affiliateProductsRouter = Router();

affiliateProductsRouter.get(
  "/",
  queryValidator(GetPublicAffiliateProductsQuerySchema),
  serverErrorCatcherWrapper(getPublicAffiliateProducts)
);

export default affiliateProductsRouter;
