import * as Yup from "yup";

// ---- Params Request ----

// Business Slug Schema
export const BusinessSlugSchema = Yup.object({
  business_slug: Yup.string().trim().min(1).max(200).required(),
});

// ---- Body Request ----
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
