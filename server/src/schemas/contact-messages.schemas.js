import * as Yup from "yup";

const CONTACT_MESSAGE_ISSUES = [
  "overheating",
  "coolant_leak",
  "radiator_fan_not_working",
  "strange_noise_or_vibration",
  "low_discolored_coolant",
  "radiator_replacement_repair",
  "routine_maintenance_flush",
  "other",
];

const isValidPhone = (value) => {
  if (!value?.trim()) return true;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

export const CreateContactMessageSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").optional(),
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").required(),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required(),
  phone: Yup.string()
    .trim()
    .test("valid-phone", "Please enter a valid phone number", isValidPhone),
  vehicleModel: Yup.string().trim().max(150),
  issue: Yup.string()
    .oneOf(CONTACT_MESSAGE_ISSUES, "Please select a valid issue")
    .required(),
  urgency: Yup.string().oneOf(["asap", "can-wait"]).required(),
  additionalDetails: Yup.string()
    .trim()
    .when("issue", {
      is: "other",
      then: (schema) =>
        schema.required("Please describe your issue when selecting Other."),
      otherwise: (schema) => schema,
    }),
});
