import * as Yup from "yup";

const isValidOptionalPhone = (value) => {
  if (!value?.trim()) return true;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

export const CreateListingRequestSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be 200 characters or fewer")
    .required("Business name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test(
      "valid-phone",
      "Please enter a valid phone number",
      isValidOptionalPhone
    ),
  message: Yup.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer")
    .required("Message is required"),
});
