import * as Yup from "yup";
import { SCORE_TIER_IDS, REVIEW_TIER_IDS, EMAIL_FILTER_IDS, WEBSITE_FILTER_IDS } from "../lib/adminBusinessTiers.js";
import { normalizeWebsiteUrl } from "../lib/websiteReachability.js";
import { getPasswordStrengthError } from "../lib/password.js";
import {
  DEFAULT_MAX_PLACES,
  DEFAULT_SEARCH_KEYWORD,
  MAX_MAX_PLACES,
  MAX_SCRAPE_CITIES,
  MIN_MAX_PLACES,
} from "../apify-scrape/constants.js";

const isValidPhone = (value) => {
  if (!value?.trim()) return false;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

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

export const DeleteClaimRequestsSchema = Yup.object({
  claim_request_ids: Yup.array()
    .of(Yup.string().uuid("Invalid claim request ID").required())
    .min(1, "At least one claim request ID is required")
    .required("Claim request IDs are required"),
});

export const DeleteListingReportsSchema = Yup.object({
  listing_report_ids: Yup.array()
    .of(Yup.string().uuid("Invalid listing report ID").required())
    .min(1, "At least one listing report ID is required")
    .required("Listing report IDs are required"),
});

export const DeleteContactInquiriesSchema = Yup.object({
  contact_inquiry_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact inquiry ID").required())
    .min(1, "At least one contact inquiry ID is required")
    .required("Contact inquiry IDs are required"),
});

export const DeleteListingRequestsSchema = Yup.object({
  listing_request_ids: Yup.array()
    .of(Yup.string().uuid("Invalid listing request ID").required())
    .min(1, "At least one listing request ID is required")
    .required("Listing request IDs are required"),
});

export const DeleteFeedbackSurveysSchema = Yup.object({
  feedback_survey_ids: Yup.array()
    .of(Yup.string().uuid("Invalid feedback survey ID").required())
    .min(1, "At least one feedback survey ID is required")
    .required("Feedback survey IDs are required"),
});

export const DeleteContactMessagesSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
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

export const CONTACT_INQUIRY_STATUSES = ["pending", "resolved", "dismissed"];

export const GetContactInquiriesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...CONTACT_INQUIRY_STATUSES, null], "Invalid status")
    .optional(),
});

export const FEEDBACK_SURVEY_FORM_TYPES = [
  "quick_contact",
  "report_info",
  "contact",
  "get_listed",
];

export const GetFeedbackSurveysQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  form_type: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...FEEDBACK_SURVEY_FORM_TYPES, null], "Invalid form type")
    .optional(),
});

export const UpdateContactInquiriesStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(CONTACT_INQUIRY_STATUSES, "Invalid status")
    .required("Status is required"),
  contact_inquiry_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact inquiry ID").required())
    .min(1, "At least one contact inquiry ID is required")
    .required("Contact inquiry IDs are required"),
});

export const LISTING_REQUEST_STATUSES = [
  "pending",
  "listed",
  "rejected",
  "duplicate",
];

export const GetListingRequestsQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...LISTING_REQUEST_STATUSES, null], "Invalid status")
    .optional(),
});

export const UpdateListingRequestsStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(LISTING_REQUEST_STATUSES, "Invalid status")
    .required("Status is required"),
  listing_request_ids: Yup.array()
    .of(Yup.string().uuid("Invalid listing request ID").required())
    .min(1, "At least one listing request ID is required")
    .required("Listing request IDs are required"),
  business_slug: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .when("status", {
      is: "listed",
      then: (schema) =>
        schema
          .required("Business slug is required when marking as listed")
          .matches(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
            "Enter a valid business slug"
          )
          .max(220, "Business slug must be 220 characters or fewer"),
      otherwise: (schema) => schema.notRequired(),
    }),
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
  featured: Yup.boolean()
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
  website_filter: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...WEBSITE_FILTER_IDS, null], "Invalid website filter")
    .optional(),
});

export const ADMIN_LOCATION_TABS = [
  "states",
  "cities",
  "postal-codes",
  "data-issues",
];

export const ADMIN_LOCATION_SORTS = ["businesses_desc", "businesses_asc"];

const locationSortQuery = Yup.string()
  .transform((value) => {
    if (value == null) return "businesses_desc";
    const trimmed = String(value).trim();
    return trimmed === "" ? "businesses_desc" : trimmed;
  })
  .oneOf(ADMIN_LOCATION_SORTS, "Invalid location sort")
  .optional();

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
  sort: locationSortQuery,
});

export const ExportAdminLocationStatesQuerySchema = Yup.object({
  sort: locationSortQuery,
});

export const ExportAdminLocationCitiesQuerySchema = Yup.object({
  state_id: Yup.string().uuid("Invalid state ID").required(),
  sort: locationSortQuery,
});

export const ExportAdminLocationPostalCodesQuerySchema = Yup.object({
  city_id: Yup.string().uuid("Invalid city ID").required(),
  sort: locationSortQuery,
});
export const BUSINESS_EMAIL_STATUSES = [
  "suspicious",
  "checked",
  "unable_to_find",
  "not_checked",
];

export const GetAdminBusinessesWithEmailsQuerySchema = Yup.object({
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
  emails_sent: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  suspicious: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  email_status: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...BUSINESS_EMAIL_STATUSES, null], "Invalid status")
    .optional(),
  require_email: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return true;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .default(true)
    .optional(),
  has_email: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
});

export const ClearBusinessEmailsSchema = Yup.object({
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(30, "At most 30 businesses can be cleared at once")
    .required("Business IDs are required"),
});

export const MarkBusinessEmailStatusSchema = Yup.object({
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(30, "At most 30 businesses can be marked at once")
    .required("Business IDs are required"),
  email_status: Yup.string()
    .oneOf(BUSINESS_EMAIL_STATUSES, "Invalid email status")
    .required("Status is required"),
});

export const UpdateBusinessEmailSchema = Yup.object({
  business_id: Yup.string()
    .uuid("Invalid business ID")
    .required("Business ID is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export const UpdateBusinessListingSchema = Yup.object({
  business_id: Yup.string()
    .uuid("Invalid business ID")
    .required("Business ID is required"),
  title: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .required("Title is required"),
  email: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test("valid-email", "Please enter a valid email address", (value) => {
      if (value == null || value === "") return true;
      return Yup.string().email().isValidSync(value);
    }),
  website: Yup.string()
    .trim()
    .transform((value) => {
      if (value === "" || value == null) return null;
      return normalizeWebsiteUrl(value);
    })
    .nullable()
    .notRequired()
    .test("valid-website", "Please enter a valid website URL", (value) => {
      if (value == null || value === "") return true;
      try {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    }),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
  address: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .required("Address is required"),
  description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Description is required")
    .max(750, "Description must be 750 characters or fewer")
    .required("Description is required"),
  title_tag: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title tag is required")
    .max(100, "Title tag is too long")
    .required("Title tag is required"),
  meta_description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Meta description is required")
    .max(200, "Meta description is too long")
    .required("Meta description is required"),
  local_note: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Local note is required")
    .max(500, "Local note is too long")
    .required("Local note is required"),
  keywords: Yup.array()
    .of(
      Yup.string()
        .transform((value) => String(value ?? "").trim())
        .min(1)
        .max(100, "Keyword is too long")
    )
    .max(30, "At most 30 keywords")
    .required("Keywords are required"),
  total_score: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      if (!Number.isFinite(num)) return originalValue;
      return Math.round(num * 10) / 10;
    })
    .typeError("Score must be a number")
    .min(0, "Score must be 0 or higher")
    .max(5, "Score cannot be more than 5")
    .required("Score is required"),
  reviews_count: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      if (!Number.isFinite(num)) return originalValue;
      return Math.trunc(num);
    })
    .typeError("Reviews must be a number")
    .integer("Reviews must be a whole number")
    .min(0, "Reviews cannot be negative")
    .max(1000000, "Reviews count is too large")
    .required("Reviews count is required"),
});

export const UpdateBusinessCategoriesSchema = Yup.object({
  business_id: Yup.string()
    .uuid("Invalid business ID")
    .required("Business ID is required"),
  primary_category_id: Yup.string()
    .uuid("Invalid primary category ID")
    .required("Primary category is required"),
  secondary_category_ids: Yup.array()
    .of(Yup.string().uuid("Invalid secondary category ID"))
    .max(10, "You can select up to 10 secondary categories")
    .default([])
    .test(
      "unique-secondary",
      "Secondary categories must be unique",
      (value) => {
        if (!value?.length) return true;
        return new Set(value).size === value.length;
      }
    ),
});

export const GetAdminBusinessParamsSchema = Yup.object({
  id: Yup.string().uuid("Invalid business ID").required("Business ID is required"),
});

export const UnclaimBusinessesSchema = Yup.object({
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(30, "At most 30 businesses can be unclaimed at once")
    .required("Business IDs are required"),
});

export const GetAdminUsersQuerySchema = Yup.object({
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
});

export const DeleteAdminUsersSchema = Yup.object({
  user_ids: Yup.array()
    .of(Yup.string().uuid("Invalid user ID").required())
    .min(1, "At least one user ID is required")
    .max(30, "At most 30 users can be deleted at once")
    .required("User IDs are required"),
});

export const GetAdminUserParamsSchema = Yup.object({
  uid: Yup.string().uuid("Invalid user ID").required("User ID is required"),
});

export const CACHE_INVALIDATE_RESOURCES = [
  "contact-messages",
  "contact-inquiries",
  "feedback-surveys",
  "claim-requests",
  "listing-reports",
  "listing-requests",
  "businesses",
  "locations",
  "dashboard",
  "reference",
  "all",
];

export const InvalidateCacheSchema = Yup.object({
  resource: Yup.string()
    .oneOf(CACHE_INVALIDATE_RESOURCES, "Invalid cache resource")
    .required("Resource is required"),
});

export const OUTREACH_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
  "custom_claim_invite",
  "claim_followup",
  "website_offer",
];

export const CLAIM_ELIGIBILITY_VALUES = [
  "able",
  "no_email",
  "email_review",
  "duplicate_email",
  "claimed",
];

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
  claim_followup_sent: optionalBoolQuery,
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
  claim_followup_sent: Yup.boolean().nullable().optional(),
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

export const SCHEDULED_OUTREACH_TYPES = [
  "claim_invite",
  "ownership_claim_invite",
  "lead_claim_invite",
  "claim_followup",
];
export const OUTREACH_SCHEDULE_LIMITS = [10, 25, 50, 75];

const OutreachScheduleCampaignSchema = Yup.object({
  outreach_type: Yup.string()
    .oneOf(SCHEDULED_OUTREACH_TYPES, "Invalid scheduled outreach type")
    .required("Outreach type is required"),
  enabled: Yup.boolean().required("Campaign enabled state is required"),
  limit_count: Yup.number()
    .oneOf(OUTREACH_SCHEDULE_LIMITS, "Invalid campaign limit")
    .required("Campaign limit is required"),
}).noUnknown();

export const UpdateOutreachSchedulerSchema = Yup.object({
  enabled: Yup.boolean().required("Scheduler enabled state is required"),
  local_time: Yup.string()
    .matches(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/,
      "Time must use 24-hour HH:mm format"
    )
    .required("Schedule time is required"),
  timezone: Yup.string()
    .oneOf(["America/Los_Angeles"], "Timezone must be Pacific Time")
    .required("Timezone is required"),
  campaigns: Yup.array()
    .of(OutreachScheduleCampaignSchema)
    .length(
      SCHEDULED_OUTREACH_TYPES.length,
      "All scheduled outreach campaigns are required"
    )
    .test(
      "scheduled-outreach-types",
      "Each scheduled outreach type must appear exactly once",
      (campaigns) => {
        const types = (campaigns ?? []).map((item) => item?.outreach_type);
        return (
          types.length === SCHEDULED_OUTREACH_TYPES.length &&
          SCHEDULED_OUTREACH_TYPES.every(
            (type) => types.filter((value) => value === type).length === 1
          )
        );
      }
    )
    .required("Campaign settings are required"),
}).noUnknown();

export const GetOutreachSchedulerRunsQuerySchema = Yup.object({
  page: Yup.number().min(1).default(1),
  limit: Yup.number().min(1).max(50).default(10),
});

export const GetOutreachSchedulerJobParamsSchema = Yup.object({
  jobId: Yup.string().uuid("Invalid scheduled outreach job ID").required(),
});

export const OutreachMarkSentSchema = Yup.object({
  outreach_type: Yup.string()
    .oneOf(OUTREACH_TYPES, "Invalid outreach type")
    .required("Outreach type is required"),
  business_ids: Yup.array()
    .of(Yup.string().uuid("Invalid business ID").required())
    .min(1, "At least one business ID is required")
    .max(75, "At most 75 businesses can be marked at once")
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
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  email_changed_or_missing: optionalBoolQuery,
  business_id: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .uuid("Invalid business ID")
    .nullable()
    .optional(),
});

export const GetOutreachHistoryMatchingIdsSchema = Yup.object({
  outreach_type: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...OUTREACH_TYPES, null], "Invalid outreach type")
    .optional(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  email_changed_or_missing: optionalBoolQuery,
  limit: Yup.number().min(1).max(100).optional(),
});

export const DeleteOutreachHistorySchema = Yup.object({
  outreach_history_ids: Yup.array()
    .of(Yup.string().uuid("Invalid outreach history ID").required())
    .min(1, "At least one outreach history ID is required")
    .max(100, "At most 100 history rows can be removed at once")
    .required("Outreach history IDs are required"),
});

export const AFFILIATE_PROVIDERS = ["amazon"];

const optionalTrimmedNullable = Yup.string()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  })
  .nullable()
  .optional();

export const GetAffiliateProductsQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
});

export const CreateAffiliateProductSchema = Yup.object({
  provider: Yup.string()
    .oneOf(AFFILIATE_PROVIDERS, "Invalid affiliate provider")
    .default("amazon")
    .required("Provider is required"),
  title: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .required("Title is required"),
  description: optionalTrimmedNullable.max(1000, "Description is too long"),
  image_url: optionalTrimmedNullable.max(2000, "Image URL is too long"),
  product_link: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .url("Product link must be a valid URL")
    .required("Product link is required"),
  affiliate_link: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .url("Affiliate link must be a valid URL")
    .required("Affiliate link is required"),
});

export const UpdateAffiliateProductSchema = CreateAffiliateProductSchema.concat(
  Yup.object({
    id: Yup.string()
      .uuid("Invalid product id")
      .required("Product id is required"),
  })
);

export const UpdateAffiliateProductsActiveSchema = Yup.object({
  is_active: Yup.boolean().required("Active status is required"),
  affiliate_product_ids: Yup.array()
    .of(Yup.string().uuid("Invalid product id").required())
    .min(1, "At least one product id is required")
    .required("Product ids are required"),
});

export const GetIngestGroupParamsSchema = Yup.object({
  groupId: Yup.string()
    .uuid("Invalid group id")
    .required("Group id is required"),
});

export const GetIngestBatchParamsSchema = Yup.object({
  batchId: Yup.string()
    .uuid("Invalid batch id")
    .required("Batch id is required"),
});

export const DeleteIngestGroupsSchema = Yup.object({
  group_ids: Yup.array()
    .of(Yup.string().uuid("Invalid group id").required())
    .min(1, "At least one group id is required")
    .required("Group ids are required"),
});

export const RetryIngestBatchBodySchema = Yup.object({
  step: Yup.string()
    .oneOf(["auto", "enrich", "insert"], "Invalid retry step")
    .optional()
    .default("auto"),
});

export const CreateCdnUploadJobSchema = Yup.object({
  limit: Yup.number()
    .integer("Limit must be an integer")
    .min(50, "Limit must be at least 50")
    .max(500, "Limit cannot exceed 500")
    .optional(),
});

export const GetCdnUploadBusinessesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(10000).required(),
  limit: Yup.number().min(1).max(30).required(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  cdn_stored: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  has_attempts: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
});

export const GetCdnUploadJobParamsSchema = Yup.object({
  jobId: Yup.string()
    .uuid("Invalid job id")
    .required("Job id is required"),
});

export const GetCdnUploadBatchParamsSchema = Yup.object({
  batchId: Yup.string()
    .uuid("Invalid batch id")
    .required("Batch id is required"),
});

export const DeleteCdnUploadJobsSchema = Yup.object({
  job_ids: Yup.array()
    .of(Yup.string().uuid("Invalid job id").required())
    .min(1, "At least one job id is required")
    .required("Job ids are required"),
});

export const CreateEmailScrapeJobSchema = Yup.object({
  limit: Yup.number()
    .integer("Limit must be an integer")
    .min(50, "Limit must be at least 50")
    .max(500, "Limit cannot exceed 500")
    .optional(),
});

export const GetEmailScrapeBusinessesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(10000).required(),
  limit: Yup.number().min(1).max(30).required(),
  q: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed.slice(0, 100);
    })
    .nullable()
    .optional(),
  has_email: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  has_attempts: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .nullable()
    .optional(),
  email_status: Yup.string()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .oneOf([...BUSINESS_EMAIL_STATUSES, null], "Invalid status")
    .optional(),
});

export const GetEmailScrapeJobParamsSchema = Yup.object({
  jobId: Yup.string()
    .uuid("Invalid job id")
    .required("Job id is required"),
});

export const GetEmailScrapeBatchParamsSchema = Yup.object({
  batchId: Yup.string()
    .uuid("Invalid batch id")
    .required("Batch id is required"),
});

export const DeleteEmailScrapeJobsSchema = Yup.object({
  job_ids: Yup.array()
    .of(Yup.string().uuid("Invalid job id").required())
    .min(1, "At least one job id is required")
    .required("Job ids are required"),
});

export const CreateApifyScrapeJobSchema = Yup.object({
  search_keyword: Yup.string()
    .trim()
    .min(1, "Search keyword is required")
    .max(100, "Search keyword cannot exceed 100 characters")
    .default(DEFAULT_SEARCH_KEYWORD),
  max_places: Yup.number()
    .integer("Max places must be an integer")
    .min(MIN_MAX_PLACES, `Max places must be at least ${MIN_MAX_PLACES}`)
    .max(MAX_MAX_PLACES, `Max places cannot exceed ${MAX_MAX_PLACES}`)
    .default(DEFAULT_MAX_PLACES),
  cities: Yup.array()
    .of(
      Yup.object({
        city: Yup.string()
          .trim()
          .min(1, "City is required")
          .max(100, "City cannot exceed 100 characters")
          .required("City is required"),
        state_id: Yup.string()
          .uuid("Invalid state id")
          .required("State is required"),
      })
    )
    .min(1, "At least one city is required")
    .max(MAX_SCRAPE_CITIES, `At most ${MAX_SCRAPE_CITIES} cities can be scraped at once`)
    .required("Cities are required"),
});

export const GetApifyScrapeJobParamsSchema = Yup.object({
  jobId: Yup.string().uuid("Invalid job id").required("Job id is required"),
});

export const DeleteApifyScrapeJobsSchema = Yup.object({
  job_ids: Yup.array()
    .of(Yup.string().uuid("Invalid job id").required())
    .min(1, "At least one job id is required")
    .required("Job ids are required"),
});

export const GetTestingListQuerySchema = Yup.object({
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
});

export const CreateTestBusinessSchema = Yup.object({
  title: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .required("Title is required"),
  slug: Yup.string()
    .transform((value) => String(value ?? "").trim().toLowerCase())
    .min(1, "Slug is required")
    .max(220, "Slug is too long")
    .required("Slug is required"),
  email: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test("valid-email", "Please enter a valid email address", (value) => {
      if (value == null || value === "") return true;
      return Yup.string().email().isValidSync(value);
    }),
  website: Yup.string()
    .trim()
    .transform((value) => {
      if (value === "" || value == null) return null;
      return normalizeWebsiteUrl(value);
    })
    .nullable()
    .notRequired()
    .test("valid-website", "Please enter a valid website URL", (value) => {
      if (value == null || value === "") return true;
      try {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    }),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
  address: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Address is required")
    .max(500, "Address is too long")
    .required("Address is required"),
  description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Description is required")
    .max(750, "Description must be 750 characters or fewer")
    .required("Description is required"),
  title_tag: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Title tag is required")
    .max(100, "Title tag is too long")
    .required("Title tag is required"),
  meta_description: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Meta description is required")
    .max(200, "Meta description is too long")
    .required("Meta description is required"),
  local_note: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Local note is required")
    .max(500, "Local note is too long")
    .required("Local note is required"),
  keywords: Yup.array()
    .of(
      Yup.string()
        .transform((value) => String(value ?? "").trim())
        .min(1)
        .max(100, "Keyword is too long")
    )
    .max(30, "At most 30 keywords")
    .required("Keywords are required"),
  highlights: Yup.array().of(Yup.mixed()).default([]).notRequired(),
  total_score: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      if (!Number.isFinite(num)) return originalValue;
      return Math.round(num * 10) / 10;
    })
    .typeError("Score must be a number")
    .min(0, "Score must be 0 or higher")
    .max(5, "Score cannot be more than 5")
    .required("Score is required"),
  reviews_count: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      if (!Number.isFinite(num)) return originalValue;
      return Math.trunc(num);
    })
    .typeError("Reviews must be a number")
    .integer("Reviews must be a whole number")
    .min(0, "Reviews cannot be negative")
    .max(1000000, "Reviews count is too large")
    .required("Reviews count is required"),
  latitude: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      return Number.isFinite(num) ? num : originalValue;
    })
    .typeError("Latitude must be a number")
    .min(-90, "Latitude is invalid")
    .max(90, "Latitude is invalid")
    .required("Latitude is required"),
  longitude: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      const num = Number(originalValue);
      return Number.isFinite(num) ? num : originalValue;
    })
    .typeError("Longitude must be a number")
    .min(-180, "Longitude is invalid")
    .max(180, "Longitude is invalid")
    .required("Longitude is required"),
  city_id: Yup.string().uuid("Invalid city").required("City is required"),
  state_id: Yup.string().uuid("Invalid state").required("State is required"),
  postal_code_id: Yup.string()
    .transform((value) => {
      const trimmed = String(value ?? "").trim();
      return trimmed === "" ? null : trimmed;
    })
    .uuid("Invalid postal code")
    .nullable()
    .notRequired(),
  primary_category_id: Yup.string()
    .uuid("Invalid category")
    .required("Primary category is required"),
  timezone: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Timezone is required")
    .max(80, "Timezone is too long")
    .required("Timezone is required"),
  image_url: Yup.string()
    .transform((value) => {
      const trimmed = String(value ?? "").trim();
      return trimmed === "" ? null : trimmed;
    })
    .nullable()
    .notRequired(),
  place_id: Yup.string()
    .transform((value) => String(value ?? "").trim())
    .min(1, "Place ID is required")
    .max(200, "Place ID is too long")
    .required("Place ID is required"),
  hours: Yup.array()
    .of(
      Yup.object({
        day_of_week: Yup.string()
          .oneOf(
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            "Invalid day of week"
          )
          .required(),
        hours: Yup.array().default([]),
        is_closed: Yup.boolean().default(false),
        hours_text: Yup.string().nullable().notRequired(),
      })
    )
    .default([]),
  secondary_category_ids: Yup.array()
    .of(Yup.string().uuid("Invalid secondary category ID"))
    .max(10, "You can select up to 10 secondary categories")
    .default([]),
});

export const CreateTestUserSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .test("password-strength", function (value) {
      const message = getPasswordStrengthError(value ?? "");
      if (!message) return true;
      return this.createError({ message });
    }),
});
