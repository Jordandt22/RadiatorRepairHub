import { Router } from "express";
import {
  loginAdmin,
  getContactMessages,
  updateContactMessagesStatus,
  updateContactMessagesArchived,
  markContactMessagesConfirmed,
  markContactMessagesDeclined,
  markContactMessagesResponded,
  markContactMessagesNoResponse,
  sendContactMessages,
  sendContactConfirmations,
  sendContactDeclined,
  sendContactNoResponse,
  getClaimRequests,
  updateClaimRequestsStatus,
  getListingReports,
  updateListingReportsStatus,
  getBusinesses,
  invalidateCache,
} from "../../controllers/admin/admin.controller.js";
import { serverErrorCatcherWrapper } from "../../helpers/wrappers.js";
import {
  LoginAdminSchema,
  UpdateContactMessagesStatusSchema,
  UpdateContactMessagesArchivedSchema,
  MarkContactMessagesConfirmedSchema,
  MarkContactMessagesDeclinedSchema,
  MarkContactMessagesRespondedSchema,
  MarkContactMessagesNoResponseSchema,
  SendContactMessagesSchema,
  SendContactConfirmationsSchema,
  SendContactDeclinedSchema,
  SendContactNoResponseSchema,
  GetContactMessagesQuerySchema,
  GetClaimRequestsQuerySchema,
  UpdateClaimRequestsStatusSchema,
  GetListingReportsQuerySchema,
  UpdateListingReportsStatusSchema,
  GetAdminBusinessesQuerySchema,
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

adminRouter.get(
  "/claim-requests",
  authAdmin,
  queryValidator(GetClaimRequestsQuerySchema),
  serverErrorCatcherWrapper(getClaimRequests)
);

adminRouter.patch(
  "/claim-requests/status",
  authAdmin,
  bodyValidator(UpdateClaimRequestsStatusSchema),
  serverErrorCatcherWrapper(updateClaimRequestsStatus)
);

adminRouter.get(
  "/listing-reports",
  authAdmin,
  queryValidator(GetListingReportsQuerySchema),
  serverErrorCatcherWrapper(getListingReports)
);

adminRouter.patch(
  "/listing-reports/status",
  authAdmin,
  bodyValidator(UpdateListingReportsStatusSchema),
  serverErrorCatcherWrapper(updateListingReportsStatus)
);

adminRouter.get(
  "/businesses",
  authAdmin,
  queryValidator(GetAdminBusinessesQuerySchema),
  serverErrorCatcherWrapper(getBusinesses)
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

adminRouter.patch(
  "/contact-messages/responded",
  authAdmin,
  bodyValidator(MarkContactMessagesRespondedSchema),
  serverErrorCatcherWrapper(markContactMessagesResponded)
);

adminRouter.patch(
  "/contact-messages/no-response",
  authAdmin,
  bodyValidator(MarkContactMessagesNoResponseSchema),
  serverErrorCatcherWrapper(markContactMessagesNoResponse)
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
  "/contact-messages/send-no-response",
  authAdmin,
  bodyValidator(SendContactNoResponseSchema),
  serverErrorCatcherWrapper(sendContactNoResponse)
);

adminRouter.post(
  "/cache/invalidate",
  authAdmin,
  bodyValidator(InvalidateCacheSchema),
  serverErrorCatcherWrapper(invalidateCache)
);

export default adminRouter;
