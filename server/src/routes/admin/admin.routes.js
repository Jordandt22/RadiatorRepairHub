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
  deleteClaimRequests,
  getListingReports,
  updateListingReportsStatus,
  getBusinesses,
  getBusinessById,
  getBusinessesWithEmails,
  clearBusinessEmails,
  updateBusinessEmail,
  updateBusinessListing,
  unclaimBusinesses,
  getUsers,
  getUserByUid,
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
  DeleteClaimRequestsSchema,
  GetListingReportsQuerySchema,
  UpdateListingReportsStatusSchema,
  GetAdminBusinessesQuerySchema,
  GetAdminBusinessesWithEmailsQuerySchema,
  GetAdminBusinessParamsSchema,
  ClearBusinessEmailsSchema,
  UpdateBusinessEmailSchema,
  UpdateBusinessListingSchema,
  UnclaimBusinessesSchema,
  GetAdminUsersQuerySchema,
  DeleteAdminUsersSchema,
  GetAdminUserParamsSchema,
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

// All routes below require a valid admin JWT.
adminRouter.use(authAdmin);

adminRouter.get(
  "/contact-messages",
  queryValidator(GetContactMessagesQuerySchema),
  serverErrorCatcherWrapper(getContactMessages)
);

adminRouter.get(
  "/claim-requests",
  queryValidator(GetClaimRequestsQuerySchema),
  serverErrorCatcherWrapper(getClaimRequests)
);

adminRouter.patch(
  "/claim-requests/status",
  bodyValidator(UpdateClaimRequestsStatusSchema),
  serverErrorCatcherWrapper(updateClaimRequestsStatus)
);

adminRouter.delete(
  "/claim-requests",
  bodyValidator(DeleteClaimRequestsSchema),
  serverErrorCatcherWrapper(deleteClaimRequests)
);

adminRouter.get(
  "/listing-reports",
  queryValidator(GetListingReportsQuerySchema),
  serverErrorCatcherWrapper(getListingReports)
);

adminRouter.patch(
  "/listing-reports/status",
  bodyValidator(UpdateListingReportsStatusSchema),
  serverErrorCatcherWrapper(updateListingReportsStatus)
);

adminRouter.get(
  "/businesses",
  queryValidator(GetAdminBusinessesQuerySchema),
  serverErrorCatcherWrapper(getBusinesses)
);

adminRouter.get(
  "/businesses/with-emails",
  queryValidator(GetAdminBusinessesWithEmailsQuerySchema),
  serverErrorCatcherWrapper(getBusinessesWithEmails)
);

adminRouter.get(
  "/businesses/:id",
  paramsValidator(GetAdminBusinessParamsSchema),
  serverErrorCatcherWrapper(getBusinessById)
);

adminRouter.patch(
  "/businesses/clear-emails",
  bodyValidator(ClearBusinessEmailsSchema),
  serverErrorCatcherWrapper(clearBusinessEmails)
);

adminRouter.patch(
  "/businesses/email",
  bodyValidator(UpdateBusinessEmailSchema),
  serverErrorCatcherWrapper(updateBusinessEmail)
);

adminRouter.patch(
  "/businesses/listing",
  bodyValidator(UpdateBusinessListingSchema),
  serverErrorCatcherWrapper(updateBusinessListing)
);

adminRouter.patch(
  "/businesses/unclaim",
  bodyValidator(UnclaimBusinessesSchema),
  serverErrorCatcherWrapper(unclaimBusinesses)
);

adminRouter.get(
  "/users",
  queryValidator(GetAdminUsersQuerySchema),
  serverErrorCatcherWrapper(getUsers)
);

adminRouter.get(
  "/users/:uid",
  paramsValidator(GetAdminUserParamsSchema),
  serverErrorCatcherWrapper(getUserByUid)
);

adminRouter.delete(
  "/users",
  bodyValidator(DeleteAdminUsersSchema),
  serverErrorCatcherWrapper(deleteUsers)
);

adminRouter.get(
  "/outreach/businesses",
  queryValidator(GetOutreachBusinessesQuerySchema),
  serverErrorCatcherWrapper(getOutreachBusinesses)
);

adminRouter.post(
  "/outreach/matching-ids",
  bodyValidator(OutreachMatchingIdsSchema),
  serverErrorCatcherWrapper(getOutreachMatchingIds)
);

adminRouter.post(
  "/outreach/preview",
  bodyValidator(OutreachPreviewSchema),
  serverErrorCatcherWrapper(previewOutreachEmails)
);

adminRouter.post(
  "/outreach/send",
  bodyValidator(OutreachSendSchema),
  serverErrorCatcherWrapper(sendOutreachEmails)
);

adminRouter.get(
  "/outreach/history",
  queryValidator(GetOutreachHistoryQuerySchema),
  serverErrorCatcherWrapper(getOutreachHistoryList)
);

adminRouter.get(
  "/affiliate-products",
  queryValidator(GetAffiliateProductsQuerySchema),
  serverErrorCatcherWrapper(getAffiliateProducts)
);

adminRouter.post(
  "/affiliate-products",
  bodyValidator(CreateAffiliateProductSchema),
  serverErrorCatcherWrapper(createAffiliateProduct)
);

adminRouter.patch(
  "/affiliate-products",
  bodyValidator(UpdateAffiliateProductSchema),
  serverErrorCatcherWrapper(updateAffiliateProduct)
);

adminRouter.patch(
  "/affiliate-products/active",
  bodyValidator(UpdateAffiliateProductsActiveSchema),
  serverErrorCatcherWrapper(updateAffiliateProductsActive)
);

adminRouter.get(
  "/locations",
  queryValidator(GetAdminLocationsQuerySchema),
  serverErrorCatcherWrapper(getLocations)
);

adminRouter.get(
  "/locations/export/states",
  queryValidator(ExportAdminLocationStatesQuerySchema),
  serverErrorCatcherWrapper(exportLocationStates)
);

adminRouter.get(
  "/locations/export/cities",
  queryValidator(ExportAdminLocationCitiesQuerySchema),
  serverErrorCatcherWrapper(exportLocationCities)
);

adminRouter.get(
  "/locations/export/postal-codes",
  queryValidator(ExportAdminLocationPostalCodesQuerySchema),
  serverErrorCatcherWrapper(exportLocationPostalCodes)
);

adminRouter.get(
  "/dashboard/stats",
  serverErrorCatcherWrapper(getDashboardStats)
);

adminRouter.patch(
  "/contact-messages/status",
  bodyValidator(UpdateContactMessagesStatusSchema),
  serverErrorCatcherWrapper(updateContactMessagesStatus)
);

adminRouter.patch(
  "/contact-messages/archived",
  bodyValidator(UpdateContactMessagesArchivedSchema),
  serverErrorCatcherWrapper(updateContactMessagesArchived)
);

adminRouter.patch(
  "/contact-messages/confirmed",
  bodyValidator(MarkContactMessagesConfirmedSchema),
  serverErrorCatcherWrapper(markContactMessagesConfirmed)
);

adminRouter.patch(
  "/contact-messages/declined",
  bodyValidator(MarkContactMessagesDeclinedSchema),
  serverErrorCatcherWrapper(markContactMessagesDeclined)
);

adminRouter.patch(
  "/contact-messages/responded",
  bodyValidator(MarkContactMessagesRespondedSchema),
  serverErrorCatcherWrapper(markContactMessagesResponded)
);

adminRouter.patch(
  "/contact-messages/no-response",
  bodyValidator(MarkContactMessagesNoResponseSchema),
  serverErrorCatcherWrapper(markContactMessagesNoResponse)
);

adminRouter.post(
  "/contact-messages/send",
  bodyValidator(SendContactMessagesSchema),
  serverErrorCatcherWrapper(sendContactMessages)
);

adminRouter.post(
  "/contact-messages/send-confirmations",
  bodyValidator(SendContactConfirmationsSchema),
  serverErrorCatcherWrapper(sendContactConfirmations)
);

adminRouter.post(
  "/contact-messages/send-declined",
  bodyValidator(SendContactDeclinedSchema),
  serverErrorCatcherWrapper(sendContactDeclined)
);

adminRouter.post(
  "/contact-messages/send-no-response",
  bodyValidator(SendContactNoResponseSchema),
  serverErrorCatcherWrapper(sendContactNoResponse)
);

adminRouter.post(
  "/cache/invalidate",
  bodyValidator(InvalidateCacheSchema),
  serverErrorCatcherWrapper(invalidateCache)
);

adminRouter.post(
  "/ingest/groups",
  ingestUpload.single("file"),
  serverErrorCatcherWrapper(createIngestGroup)
);

adminRouter.get(
  "/ingest/groups",
  serverErrorCatcherWrapper(getIngestGroups)
);

adminRouter.get(
  "/ingest/groups/:groupId",
  paramsValidator(GetIngestGroupParamsSchema),
  serverErrorCatcherWrapper(getIngestGroupById)
);

adminRouter.get(
  "/ingest/batches/:batchId",
  paramsValidator(GetIngestBatchParamsSchema),
  serverErrorCatcherWrapper(getIngestBatchById)
);

adminRouter.delete(
  "/ingest/groups",
  bodyValidator(DeleteIngestGroupsSchema),
  serverErrorCatcherWrapper(deleteIngestGroupsHandler)
);

export default adminRouter;
