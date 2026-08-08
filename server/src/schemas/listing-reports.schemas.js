import * as Yup from "yup";

export const LISTING_REPORT_REASONS = [
  "wrong_claim_contact",
  "incorrect_outdated",
  "inappropriate",
];

const isValidOptionalPhone = (value) => {
  if (!value?.trim()) return true;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

export const CreateListingReportSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  reason: Yup.string()
    .oneOf(LISTING_REPORT_REASONS, "Please select a valid reason")
    .required("Please select a reason"),
  details: Yup.string()
    .trim()
    .min(10, "Please provide at least 10 characters of detail")
    .max(2000, "Details must be 2000 characters or fewer")
    .required("Please describe the issue"),
  reporterEmail: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  reporterName: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .max(150, "Name must be 150 characters or fewer")
    .notRequired(),
  suggestedPhone: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test(
      "valid-phone",
      "Please enter a valid phone number",
      isValidOptionalPhone
    ),
  suggestedEmail: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test("valid-email", "Please enter a valid email address", (value) => {
      if (value == null || value === "") return true;
      return Yup.string().email().isValidSync(value);
    }),
});
