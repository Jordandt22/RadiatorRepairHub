import { Router } from "express";
import {
  loginAdmin,
  getContactMessages,
  updateContactMessagesStatus,
} from "../../controllers/admin/admin.controller.js";
import { serverErrorCatcherWrapper } from "../../helpers/wrappers.js";
import {
  LoginAdminSchema,
  UpdateContactMessagesStatusSchema,
  GetContactMessagesQuerySchema,
} from "../../schemas/admin.schemas.js";
import { bodyValidator, queryValidator } from "../../middleware/validators.js";
import { authAdmin } from "../../middleware/admin.mw.js";

const adminRouter = Router();

adminRouter.post(
  "/login",
  bodyValidator(LoginAdminSchema),
  serverErrorCatcherWrapper(loginAdmin)
);

adminRouter.get(
  "/contact-messages",
  authAdmin,
  queryValidator(GetContactMessagesQuerySchema),
  serverErrorCatcherWrapper(getContactMessages)
);

adminRouter.patch(
  "/contact-messages/status",
  authAdmin,
  bodyValidator(UpdateContactMessagesStatusSchema),
  serverErrorCatcherWrapper(updateContactMessagesStatus)
);

export default adminRouter;
