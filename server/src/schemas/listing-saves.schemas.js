import * as Yup from "yup";

export const CreateListingSaveSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  name: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .max(150, "Name must be 150 characters or fewer")
    .notRequired(),
});
