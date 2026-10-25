import * as Yup from "yup";

const isValidPhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

const emptyToUndefined = (_value, original) => {
  if (original == null || String(original).trim() === "") return undefined;
  return String(original).trim();
};

export const CreateTemplateLeadSchema = Yup.object({
  businessId: Yup.string()
    .transform(emptyToUndefined)
    .notRequired()
    .uuid("Unknown site"),
  siteId: Yup.string()
    .transform(emptyToUndefined)
    .notRequired()
    .max(80, "Unknown site"),
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be 150 characters or fewer")
    .required("Name is required"),
  phone: Yup.string()
    .trim()
    .required("Phone is required")
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
  email: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .email("Please enter a valid email address"),
  service: Yup.string()
    .trim()
    .max(200, "Service must be 200 characters or fewer")
    .required("Service is required"),
  vehicle: Yup.string()
    .trim()
    .max(200, "Vehicle must be 200 characters or fewer")
    .required("Vehicle is required"),
  issue: Yup.string()
    .trim()
    .min(5, "Please describe the issue in at least 5 characters")
    .max(5000, "Issue must be 5000 characters or fewer")
    .required("Please describe the issue"),
  company: Yup.string().max(500).nullable().notRequired(),
});
