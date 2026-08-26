import * as Yup from "yup";

export const CreateCheckoutSessionSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
});

export const GetCheckoutSessionQuerySchema = Yup.object({
  session_id: Yup.string()
    .trim()
    .required("Checkout session is required")
    .matches(/^cs_[A-Za-z0-9_]+$/, "Invalid checkout session"),
});
