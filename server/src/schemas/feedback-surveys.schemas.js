import * as Yup from "yup";

export const FEEDBACK_SURVEY_FORM_TYPES = [
  "quick_contact",
  "report_info",
  "contact",
  "get_listed",
];

export const FEEDBACK_SURVEY_FOUND_VIAS = [
  "google_search",
  "referral",
  "social_media",
  "other",
];

export const FEEDBACK_SURVEY_FOUND_LOOKING_FOR = ["yes", "no", "partially"];

export const CreateFeedbackSurveySchema = Yup.object({
  formType: Yup.string()
    .oneOf(FEEDBACK_SURVEY_FORM_TYPES, "Invalid form type")
    .required("Form type is required"),
  businessId: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .uuid("Invalid business ID"),
  foundVia: Yup.string()
    .oneOf(FEEDBACK_SURVEY_FOUND_VIAS, "Please select how you found us")
    .required("Please select how you found us"),
  foundLookingFor: Yup.string()
    .oneOf(
      FEEDBACK_SURVEY_FOUND_LOOKING_FOR,
      "Please tell us if you found what you were looking for"
    )
    .required("Please tell us if you found what you were looking for"),
  comment: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .max(500, "Feedback must be 500 characters or fewer"),
});
