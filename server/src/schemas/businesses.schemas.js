import * as Yup from "yup";

// ---- Params Request ----

// Business ID Schema
export const BusinessIDSchema = Yup.object({
  business_id: Yup.string().trim().min(1).max(150).required(),
});

// ---- Body Request ----
