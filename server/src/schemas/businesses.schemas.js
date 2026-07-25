import * as Yup from "yup";
import { normalizeWebsiteUrl } from "../lib/websiteReachability.js";

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

export const CompleteClaimSchema = Yup.object({
  claimRequestId: Yup.string()
    .trim()
    .uuid("Invalid claim request ID")
    .required(),
  code: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z0-9]{6}$/, "Verification code must be 6 letters or numbers")
    .required(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
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
  sort_option: Yup.number().min(1).max(4).required(), // 1: Most Reviews, 2: Least Reviews, 3: Highest Score, 4: Lowest Score
  open: Yup.object({
    weekdays: Yup.boolean(),
    weekends: Yup.boolean(),
  }),
});
