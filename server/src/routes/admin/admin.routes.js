import { Router } from "express";
import {
  loginAdmin,
  getContactMessages,
  updateContactMessagesStatus,
  updateContactMessagesArchived,
  markContactMessagesConfirmed,
  markContactMessagesDeclined,
  sendContactMessages,
  sendContactConfirmations,
  sendContactDeclined,
  invalidateCache,
} from "../../controllers/admin/admin.controller.js";
import { serverErrorCatcherWrapper } from "../../helpers/wrappers.js";
import {
  LoginAdminSchema,
  UpdateContactMessagesStatusSchema,
  UpdateContactMessagesArchivedSchema,
  MarkContactMessagesConfirmedSchema,
  MarkContactMessagesDeclinedSchema,
  SendContactMessagesSchema,
  SendContactConfirmationsSchema,
  SendContactDeclinedSchema,
  GetContactMessagesQuerySchema,
  InvalidateCacheSchema,
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

adminRouter.patch(
  "/contact-messages/archived",
  authAdmin,
  bodyValidator(UpdateContactMessagesArchivedSchema),
  serverErrorCatcherWrapper(updateContactMessagesArchived)
);

adminRouter.patch(
  "/contact-messages/confirmed",
  authAdmin,
  bodyValidator(MarkContactMessagesConfirmedSchema),
  serverErrorCatcherWrapper(markContactMessagesConfirmed)
);

adminRouter.patch(
  "/contact-messages/declined",
  authAdmin,
  bodyValidator(MarkContactMessagesDeclinedSchema),
  serverErrorCatcherWrapper(markContactMessagesDeclined)
);

adminRouter.post(
  "/contact-messages/send",
  authAdmin,
  bodyValidator(SendContactMessagesSchema),
  serverErrorCatcherWrapper(sendContactMessages)
);

adminRouter.post(
  "/contact-messages/send-confirmations",
  authAdmin,
  bodyValidator(SendContactConfirmationsSchema),
  serverErrorCatcherWrapper(sendContactConfirmations)
);

adminRouter.post(
  "/contact-messages/send-declined",
  authAdmin,
  bodyValidator(SendContactDeclinedSchema),
  serverErrorCatcherWrapper(sendContactDeclined)
);

adminRouter.post(
  "/cache/invalidate",
  authAdmin,
  bodyValidator(InvalidateCacheSchema),
  serverErrorCatcherWrapper(invalidateCache)
);

export default adminRouter;
