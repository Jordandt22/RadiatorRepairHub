import * as Yup from "yup";
import { normalizeWebsiteUrl } from "../lib/websiteReachability.js";
import { getPasswordStrengthError } from "../lib/password.js";

// ---- Params Request ----

// Business Slug Schema
export const BusinessSlugSchema = Yup.object({
  business_slug: Yup.string().trim().min(1).max(200).required(),
});

export const ClaimRequestIdSchema = Yup.object({
  claim_request_id: Yup.string()
    .trim()
    .uuid("Invalid claim request ID")
    .required(),
});

// ---- Body Request ----
export const ClaimBusinessSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
});

export const CancelClaimSchema = Yup.object({
  claimRequestId: Yup.string()
    .trim()
    .uuid("Invalid claim request ID")
    .required(),
});

const ClaimVerificationCodeSchema = {
  claimRequestId: Yup.string()
    .trim()
    .uuid("Invalid claim request ID")
    .required(),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z0-9]{6}$/, "Verification code must be 6 letters or numbers")
    .required(),
};

/** Signed-in owners: code only — attach business to current account. */
export const CompleteClaimAuthenticatedSchema = Yup.object({
  ...ClaimVerificationCodeSchema,
});

/** Unsigned: create account with password during claim. */
export const CompleteClaimSchema = Yup.object({
  ...ClaimVerificationCodeSchema,
  password: Yup.string()
    .required("Password is required")
    .test("password-strength", function (value) {
      const message = getPasswordStrengthError(value ?? "");
      if (!message) return true;
      return this.createError({ message });
    }),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const isValidPhone = (value) => {
  if (!value?.trim()) return false;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

export const UpdateBusinessContactSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
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
});

export const UnclaimOwnedBusinessSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
});

export const UpdateBusinessCategoriesSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  primaryCategoryId: Yup.string()
    .trim()
    .uuid("Invalid primary category ID")
    .required("Primary category is required"),
  secondaryCategoryIds: Yup.array()
    .of(Yup.string().trim().uuid("Invalid secondary category ID"))
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

const amenityBoolean = Yup.boolean().required();

export const UpdateBusinessAmenitiesSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  features: Yup.object({
    appointments_recommended: amenityBoolean,
    credit_cards: amenityBoolean,
    debit_cards: amenityBoolean,
    mechanic: amenityBoolean,
    nfc_mobile_payments: amenityBoolean,
    oil_change: amenityBoolean,
    onsite_services: amenityBoolean,
    restroom: amenityBoolean,
    wheelchair_accessible: amenityBoolean,
  })
    .required("Amenities are required")
    .noUnknown(true, "Unknown amenity field"),
});

export const UpdateBusinessAboutSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  description: Yup.string()
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .required("About text is required.")
    .min(1, "About text is required.")
    .max(750, "About text must be 750 characters or fewer."),
});

const TIME_RE = /^([01]\d|2[0-3]):(00|15|30|45)$/;
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const parseMinutes = (timeStr) => {
  const [hours, minutes] = String(timeStr).split(":");
  return Number(hours) * 60 + Number(minutes || 0);
};

const HoursPeriodSchema = Yup.object({
  open: Yup.string()
    .matches(TIME_RE, "Open time must be in 15-minute increments.")
    .required("Open time is required."),
  close: Yup.string()
    .matches(TIME_RE, "Close time must be in 15-minute increments.")
    .required("Close time is required."),
}).test(
  "close-after-open",
  "Close time must be after open time.",
  (period) => {
    if (!period?.open || !period?.close) return true;
    return parseMinutes(period.close) > parseMinutes(period.open);
  }
);

const HoursDaySchema = Yup.object({
  day_of_week: Yup.string()
    .oneOf(WEEKDAYS, "Invalid day of week.")
    .required("Day of week is required."),
  is_closed: Yup.boolean().required(),
  hours: Yup.array()
    .of(HoursPeriodSchema)
    .max(2, "You can set up to 2 time periods per day.")
    .default([]),
}).test(
  "closed-or-hours",
  "Open days need at least one valid time period.",
  (day) => {
    if (!day) return false;
    if (day.is_closed) return !day.hours?.length;
    return Array.isArray(day.hours) && day.hours.length >= 1;
  }
);

export const UpdateBusinessHoursSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  days: Yup.array()
    .of(HoursDaySchema)
    .length(7, "Hours must include all 7 days of the week.")
    .required("Hours are required.")
    .test(
      "unique-days",
      "Each day of the week must appear exactly once.",
      (days) => {
        if (!days?.length) return false;
        const names = days.map((day) => day.day_of_week);
        return (
          names.length === WEEKDAYS.length &&
          WEEKDAYS.every((day) => names.includes(day))
        );
      }
    ),
});

export const SearchBusinessesSchema = Yup.object({
  title: Yup.string().trim().max(150),
  state_id: Yup.string().trim().max(150),
  city_id: Yup.string().trim().max(150),
  postal_code_id: Yup.string().trim().max(150),
  total_score: Yup.number().min(1).max(5),
  reviews_count: Yup.number().min(1).max(500),
  primary_category_id: Yup.string().trim().max(150),
  secondary_categories: Yup.array().of(Yup.string().trim().max(150)).max(5),
  features: Yup.object({
    appointments_recommended: Yup.boolean(),
    credit_cards: Yup.boolean(),
    debit_cards: Yup.boolean(),
    mechanic: Yup.boolean(),
    nfc_mobile_payments: Yup.boolean(),
    oil_change: Yup.boolean(),
    onsite_services: Yup.boolean(),
    restroom: Yup.boolean(),
    wheelchair_accessible: Yup.boolean(),
  }),
  sort_option: Yup.number().min(1).max(6).required(), // 1–4 quality, 5 Verified, 6 Featured (default)
  open: Yup.object({
    weekdays: Yup.boolean(),
    weekends: Yup.boolean(),
  }),
});
