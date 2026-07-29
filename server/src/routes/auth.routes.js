import { Router } from "express";
import { loginOwner, updateOwnerEmail } from "../controllers/auth.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  OwnerLoginSchema,
  UpdateOwnerEmailSchema,
} from "../schemas/auth.schemas.js";
import { bodyValidator } from "../middleware/validators.js";
import { authUser } from "../middleware/auth.mw.js";

const authRouter = Router();

authRouter.post(
  "/login",
  bodyValidator(OwnerLoginSchema),
  serverErrorCatcherWrapper(loginOwner)
);

authRouter.patch(
  "/email",
  authUser,
  bodyValidator(UpdateOwnerEmailSchema),
  serverErrorCatcherWrapper(updateOwnerEmail)
);

export default authRouter;
