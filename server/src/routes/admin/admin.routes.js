import { Router } from "express";
import multer from "multer";
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
  getBusinessesWithEmails,
  clearBusinessEmails,
  updateBusinessEmail,
  unclaimBusinesses,
  getUsers,
  deleteUsers,
  getLocations,
  exportLocationStates,
  exportLocationCities,
  exportLocationPostalCodes,
  getDashboardStats,
  invalidateCache,
  getOutreachBusinesses,
  getOutreachMatchingIds,
  previewOutreachEmails,
  sendOutreachEmails,
  getOutreachHistoryList,
  getAffiliateProducts,
  createAffiliateProduct,
  updateAffiliateProduct,
  updateAffiliateProductsActive,
  createIngestGroup,
  getIngestGroups,
  getIngestGroupById,
  getIngestBatchById,
  deleteIngestGroupsHandler,
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
  GetAdminBusinessesWithEmailsQuerySchema,
  ClearBusinessEmailsSchema,
  UpdateBusinessEmailSchema,
  UnclaimBusinessesSchema,
  GetAdminUsersQuerySchema,
  DeleteAdminUsersSchema,
  GetAdminLocationsQuerySchema,
  ExportAdminLocationStatesQuerySchema,
  ExportAdminLocationCitiesQuerySchema,
  ExportAdminLocationPostalCodesQuerySchema,
  InvalidateCacheSchema,
  GetOutreachBusinessesQuerySchema,
  OutreachMatchingIdsSchema,
  OutreachPreviewSchema,
  OutreachSendSchema,
  GetOutreachHistoryQuerySchema,
  GetAffiliateProductsQuerySchema,
  CreateAffiliateProductSchema,
  UpdateAffiliateProductSchema,
  UpdateAffiliateProductsActiveSchema,
  GetIngestGroupParamsSchema,
  GetIngestBatchParamsSchema,
  DeleteIngestGroupsSchema,
} from "../../schemas/admin.schemas.js";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/validators.js";
import { authAdmin } from "../../middleware/admin.mw.js";

const ingestUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

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

adminRouter.get(
  "/businesses/with-emails",
  authAdmin,
  queryValidator(GetAdminBusinessesWithEmailsQuerySchema),
  serverErrorCatcherWrapper(getBusinessesWithEmails)
);

adminRouter.patch(
  "/businesses/clear-emails",
  authAdmin,
  bodyValidator(ClearBusinessEmailsSchema),
  serverErrorCatcherWrapper(clearBusinessEmails)
);

adminRouter.patch(
  "/businesses/email",
  authAdmin,
  bodyValidator(UpdateBusinessEmailSchema),
  serverErrorCatcherWrapper(updateBusinessEmail)
);

adminRouter.patch(
  "/businesses/unclaim",
  authAdmin,
  bodyValidator(UnclaimBusinessesSchema),
  serverErrorCatcherWrapper(unclaimBusinesses)
);

adminRouter.get(
  "/users",
  authAdmin,
  queryValidator(GetAdminUsersQuerySchema),
  serverErrorCatcherWrapper(getUsers)
);

adminRouter.delete(
  "/users",
  authAdmin,
  bodyValidator(DeleteAdminUsersSchema),
  serverErrorCatcherWrapper(deleteUsers)
);

adminRouter.get(
  "/outreach/businesses",
  authAdmin,
  queryValidator(GetOutreachBusinessesQuerySchema),
  serverErrorCatcherWrapper(getOutreachBusinesses)
);

adminRouter.post(
  "/outreach/matching-ids",
  authAdmin,
  bodyValidator(OutreachMatchingIdsSchema),
  serverErrorCatcherWrapper(getOutreachMatchingIds)
);

adminRouter.post(
  "/outreach/preview",
  authAdmin,
  bodyValidator(OutreachPreviewSchema),
  serverErrorCatcherWrapper(previewOutreachEmails)
);

adminRouter.post(
  "/outreach/send",
  authAdmin,
  bodyValidator(OutreachSendSchema),
  serverErrorCatcherWrapper(sendOutreachEmails)
);

adminRouter.get(
  "/outreach/history",
  authAdmin,
  queryValidator(GetOutreachHistoryQuerySchema),
  serverErrorCatcherWrapper(getOutreachHistoryList)
);

adminRouter.get(
  "/affiliate-products",
  authAdmin,
  queryValidator(GetAffiliateProductsQuerySchema),
  serverErrorCatcherWrapper(getAffiliateProducts)
);

adminRouter.post(
  "/affiliate-products",
  authAdmin,
  bodyValidator(CreateAffiliateProductSchema),
  serverErrorCatcherWrapper(createAffiliateProduct)
);

adminRouter.patch(
  "/affiliate-products",
  authAdmin,
  bodyValidator(UpdateAffiliateProductSchema),
  serverErrorCatcherWrapper(updateAffiliateProduct)
);

adminRouter.patch(
  "/affiliate-products/active",
  authAdmin,
  bodyValidator(UpdateAffiliateProductsActiveSchema),
  serverErrorCatcherWrapper(updateAffiliateProductsActive)
);

adminRouter.get(
  "/locations",
  authAdmin,
  queryValidator(GetAdminLocationsQuerySchema),
  serverErrorCatcherWrapper(getLocations)
);

adminRouter.get(
  "/locations/export/states",
  authAdmin,
  queryValidator(ExportAdminLocationStatesQuerySchema),
  serverErrorCatcherWrapper(exportLocationStates)
);

adminRouter.get(
  "/locations/export/cities",
  authAdmin,
  queryValidator(ExportAdminLocationCitiesQuerySchema),
  serverErrorCatcherWrapper(exportLocationCities)
);

adminRouter.get(
  "/locations/export/postal-codes",
  authAdmin,
  queryValidator(ExportAdminLocationPostalCodesQuerySchema),
  serverErrorCatcherWrapper(exportLocationPostalCodes)
);

adminRouter.get(
  "/dashboard/stats",
  authAdmin,
  serverErrorCatcherWrapper(getDashboardStats)
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

adminRouter.post(
  "/ingest/groups",
  authAdmin,
  ingestUpload.single("file"),
  serverErrorCatcherWrapper(createIngestGroup)
);

adminRouter.get(
  "/ingest/groups",
  authAdmin,
  serverErrorCatcherWrapper(getIngestGroups)
);

adminRouter.get(
  "/ingest/groups/:groupId",
  authAdmin,
  paramsValidator(GetIngestGroupParamsSchema),
  serverErrorCatcherWrapper(getIngestGroupById)
);

adminRouter.get(
  "/ingest/batches/:batchId",
  authAdmin,
  paramsValidator(GetIngestBatchParamsSchema),
  serverErrorCatcherWrapper(getIngestBatchById)
);

adminRouter.delete(
  "/ingest/groups",
  authAdmin,
  bodyValidator(DeleteIngestGroupsSchema),
  serverErrorCatcherWrapper(deleteIngestGroupsHandler)
);

export default adminRouter;
