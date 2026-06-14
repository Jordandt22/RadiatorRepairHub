import * as Yup from "yup";

export const CategorySlugSchema = Yup.object({
  slug: Yup.string().trim().min(1).max(100).required(),
});
