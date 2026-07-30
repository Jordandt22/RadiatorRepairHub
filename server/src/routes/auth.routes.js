import { Router } from "express";
import {
  loginOwner,
  updateOwnerEmail,
  updateOwnerPassword,
  deleteOwnerAccount,
} from "../controllers/auth.controller.js";
import { serverErrorCatcherWrapper } from "../helpers/wrappers.js";
import {
  OwnerLoginSchema,
  UpdateOwnerEmailSchema,
  UpdateOwnerPasswordSchema,
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

authRouter.patch(
  "/password",
  authUser,
  bodyValidator(UpdateOwnerPasswordSchema),
  serverErrorCatcherWrapper(updateOwnerPassword)
);

authRouter.delete(
  "/account",
  authUser,
  serverErrorCatcherWrapper(deleteOwnerAccount)
);

export default authRouter;
