import * as Yup from "yup";

// ---- Params Request ----

// Business ID Schema
export const BusinessIDSchema = Yup.object({
  business_id: Yup.string().trim().min(1).max(150).required(),
});

// ---- Body Request ----

// ---- Query Params ----

// State Businesses Query Schema
export const stateBusinessesSchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
});
