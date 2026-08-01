import * as Yup from "yup";
import { SCORE_TIER_IDS, REVIEW_TIER_IDS, EMAIL_FILTER_IDS } from "../lib/adminBusinessTiers.js";

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
  state_code: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim().toUpperCase();
      return trimmed === "" ? null : trimmed.slice(0, 10);
    })
    .nullable()
    .optional(),
  city_slug: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim().toLowerCase();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  postal_code: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 20);
    })
    .nullable()
    .optional(),
  score_tier: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...SCORE_TIER_IDS, null], "Invalid score tier")
    .optional(),
  reviews_tier: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...REVIEW_TIER_IDS, null], "Invalid reviews tier")
    .optional(),
  email_filter: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...EMAIL_FILTER_IDS, null], "Invalid email filter")
    .optional(),
});

export const ADMIN_LOCATION_TABS = [
  "states",
  "cities",
  "postal-codes",
  "data-issues",
];

export const GetAdminLocationsQuerySchema = Yup.object({
  tab: Yup.string()
    .oneOf(ADMIN_LOCATION_TABS, "Invalid location tab")
    .required(),
  page: Yup.number().min(1).max(200).required(),
  limit: Yup.number().min(1).max(1000).required(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  state_id: Yup.string()
    .transform((value) => {
      if (value === "" || value == null) return null;
      return value;
    })
    .nullable()
    .uuid("Invalid state ID")
    .optional(),
  city_id: Yup.string()
    .transform((value) => {
      if (value === "" || value == null) return null;
      return value;
    })
    .nullable()
    .uuid("Invalid city ID")
    .optional(),
});

export const CACHE_INVALIDATE_RESOURCES = [
  "contact-messages",
  "claim-requests",
  "listing-reports",
  "businesses",
  "locations",
];

export const InvalidateCacheSchema = Yup.object({
  resource: Yup.string()
    .oneOf(CACHE_INVALIDATE_RESOURCES, "Invalid cache resource")
    .required("Resource is required"),
});

export const OUTREACH_TYPES = ["claim_invite", "website_offer"];

export const CLAIM_ELIGIBILITY_VALUES = [
  "able",
  "no_email",
  "duplicate_email",
  "claimed",
];

export const WEBSITE_FILTER_IDS = ["has", "none"];

const optionalBoolQuery = Yup.boolean()
  .transform((value, originalValue) => {
    if (originalValue === "" || originalValue == null) return null;
    if (originalValue === "true" || originalValue === true) return true;
    if (originalValue === "false" || originalValue === false) return false;
    return value;
  })
  .nullable()
  .optional();

export const GetOutreachBusinessesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  claim_eligibility: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...CLAIM_ELIGIBILITY_VALUES, null], "Invalid claim eligibility")
    .optional(),
  website_filter: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...WEBSITE_FILTER_IDS, null], "Invalid website filter")
    .optional(),
  claim_invite_sent: optionalBoolQuery,
  website_offer_sent: optionalBoolQuery,
});

export const OutreachMatchingIdsSchema = Yup.object({
  outreach_type: Yup.string()
    .oneOf(OUTREACH_TYPES, "Invalid outreach type")
    .required("Outreach type is required"),
  limit: Yup.number().min(1).max(50).default(25).optional(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  claim_eligibility: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...CLAIM_ELIGIBILITY_VALUES, null], "Invalid claim eligibility")
    .optional(),
  website_filter: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...WEBSITE_FILTER_IDS, null], "Invalid website filter")
    .optional(),
  claim_invite_sent: Yup.boolean().nullable().optional(),
  website_offer_sent: Yup.boolean().nullable().optional(),
});

export const OutreachPreviewSchema = Yup.object({
  outreach_type: Yup.string()
    .oneOf(OUTREACH_TYPES, "Invalid outreach type")
    .required("Outreach type is required"),
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(75, "At most 75 businesses can be previewed at once")
    .required("Business IDs are required"),
});

export const OutreachSendSchema = Yup.object({
  outreach_type: Yup.string()
    .oneOf(OUTREACH_TYPES, "Invalid outreach type")
    .required("Outreach type is required"),
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(75, "At most 75 businesses can be sent at once")
    .required("Business IDs are required"),
});

export const GetOutreachHistoryQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  outreach_type: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...OUTREACH_TYPES, null], "Invalid outreach type")
    .optional(),
});
