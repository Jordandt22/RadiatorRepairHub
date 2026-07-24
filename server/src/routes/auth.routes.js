import { Router } from "express";
import { loginOwner } from "../controllers/auth.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import { OwnerLoginSchema } from "../schemas/auth.schemas.js";
import { bodyValidator } from "../middleware/validators.js";

const authRouter = Router();

authRouter.post(
  "/login",
  bodyValidator(OwnerLoginSchema),
  serverErrorCatcherWrapper(loginOwner)
);

export default authRouter;
