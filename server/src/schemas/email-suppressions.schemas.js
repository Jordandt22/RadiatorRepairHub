import * as Yup from "yup";

export const EMAIL_SUPPRESSION_QUERY_TYPES = [
  "weekly_digest",
  "business_email",
  "review_request",
];

export const GetEmailSuppressionsQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  q: Yup.string().trim().max(100).optional(),
  type: Yup.string()
    .transform((value, original) => {
      if (original == null || original === "" || original === "all") return null;
      return value;
    })
    .nullable()
    .oneOf([...EMAIL_SUPPRESSION_QUERY_TYPES, null])
    .optional(),
});
