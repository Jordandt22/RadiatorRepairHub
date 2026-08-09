import * as Yup from "yup";

export const CONTACT_INQUIRY_SUBJECTS = [
  "General Inquiry",
  "Website Feedback / Suggestions",
  "Report a Listing Problem",
  "Advertising / Partnerships",
  "Business Listing Help",
  "Other",
];

const isValidOptionalPhone = (value) => {
  if (!value?.trim()) return true;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

export const CreateContactInquirySchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be 150 characters or fewer")
    .required("Name is required"),
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
  subject: Yup.string()
    .oneOf(CONTACT_INQUIRY_SUBJECTS, "Please select a valid inquiry type")
    .required("Please select an inquiry type"),
  message: Yup.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer")
    .required("Message is required"),
});
