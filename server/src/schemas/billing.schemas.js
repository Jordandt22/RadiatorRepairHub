import * as Yup from "yup";

export const CreateCheckoutSessionSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
});
