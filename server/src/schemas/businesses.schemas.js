import * as Yup from "yup";

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
