import * as Yup from "yup";

// ---- Params Request ----

// Business ID Schema
export const BusinessIDSchema = Yup.object({
  business_id: Yup.string().trim().min(1).max(150).required(),
});

// ---- Body Request ----
export const SearchBusinessesSchema = Yup.object({
  title: Yup.string().trim().max(150),
  state_id: Yup.string().trim().max(150),
  city_id: Yup.string().trim().max(150),
  total_score: Yup.number().min(0).max(5),
  reviews_count: Yup.number().min(0),
  primary_category_id: Yup.string().trim().max(150),
  secondary_category_ids: Yup.array().of(Yup.string().trim().max(150)).max(5),
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
  sort_ascending: Yup.object({
    total_score: Yup.boolean().required(),
    reviews_count: Yup.boolean().required(),
  }).required(),
});
