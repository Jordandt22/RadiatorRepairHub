import * as Yup from "yup";

export const LoginAdminSchema = Yup.object({
  password: Yup.string().trim().required("Password is required"),
});

export const CONTACT_MESSAGE_STATUSES = [
  "pending",
  "sent",
  "declined",
  "no_response",
  "responded",
  "approved",
  "flagged",
];

export const CONTACT_MESSAGE_QUERY_STATUSES = [
  ...CONTACT_MESSAGE_STATUSES,
  "result",
];

export const UpdateContactMessagesStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(CONTACT_MESSAGE_STATUSES, "Invalid status")
    .required("Status is required"),
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const SendContactMessagesSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .max(5, "At most 5 contact messages can be sent at once")
    .required("Contact message IDs are required"),
});

export const SendContactConfirmationsSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .max(5, "At most 5 contact messages can be sent at once")
    .required("Contact message IDs are required"),
});

export const SendContactDeclinedSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .max(5, "At most 5 contact messages can be sent at once")
    .required("Contact message IDs are required"),
});

export const MarkContactMessagesDeclinedSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const MarkContactMessagesRespondedSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const MarkContactMessagesNoResponseSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const SendContactNoResponseSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .max(5, "At most 5 contact messages can be sent at once")
    .required("Contact message IDs are required"),
});

export const UpdateContactMessagesArchivedSchema = Yup.object({
  archived: Yup.boolean().required("Archived is required"),
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const MarkContactMessagesConfirmedSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const GetContactMessagesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...CONTACT_MESSAGE_QUERY_STATUSES, null], "Invalid status")
    .optional(),
  archived: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return false;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .default(false)
    .optional(),
});

export const CLAIM_REQUEST_STATUSES = [
  "pending",
  "success",
  "failed",
  "expired",
];

export const GetClaimRequestsQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...CLAIM_REQUEST_STATUSES, null], "Invalid status")
    .optional(),
});

export const UpdateClaimRequestsStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(CLAIM_REQUEST_STATUSES, "Invalid status")
    .required("Status is required"),
  claim_request_ids: Yup.array()
    .of(Yup.string().uuid("Invalid claim request ID").required())
    .min(1, "At least one claim request ID is required")
    .required("Claim request IDs are required"),
});

export const LISTING_REPORT_STATUSES = ["pending", "resolved", "dismissed"];

export const GetListingReportsQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...LISTING_REPORT_STATUSES, null], "Invalid status")
    .optional(),
});

export const UpdateListingReportsStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(LISTING_REPORT_STATUSES, "Invalid status")
    .required("Status is required"),
  listing_report_ids: Yup.array()
    .of(Yup.string().uuid("Invalid listing report ID").required())
    .min(1, "At least one listing report ID is required")
    .required("Listing report IDs are required"),
});

export const GetAdminBusinessesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  claimed: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
});

export const CACHE_INVALIDATE_RESOURCES = [
  "contact-messages",
  "claim-requests",
  "listing-reports",
  "businesses",
];

export const InvalidateCacheSchema = Yup.object({
  resource: Yup.string()
    .oneOf(CACHE_INVALIDATE_RESOURCES, "Invalid cache resource")
    .required("Resource is required"),
});
