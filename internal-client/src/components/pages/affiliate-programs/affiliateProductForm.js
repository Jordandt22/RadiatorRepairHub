import * as Yup from "yup";

export const AFFILIATE_PROVIDER_OPTIONS = [
  { value: "amazon", label: "Amazon" },
];

export const affiliateProductFormSchema = Yup.object({
  provider: Yup.string()
    .oneOf(
      AFFILIATE_PROVIDER_OPTIONS.map((option) => option.value),
      "Invalid provider"
    )
    .required("Provider is required"),
  title: Yup.string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .required("Title is required"),
  description: Yup.string().trim().max(1000, "Description is too long"),
  image_url: Yup.string().trim().max(2000, "Image URL is too long"),
  product_link: Yup.string()
    .trim()
    .url("Product link must be a valid URL")
    .required("Product link is required"),
  affiliate_link: Yup.string()
    .trim()
    .url("Affiliate link must be a valid URL")
    .required("Affiliate link is required"),
});

export const AFFILIATE_PRODUCT_INITIAL_VALUES = {
  provider: "amazon",
  title: "",
  description: "",
  image_url: "",
  product_link: "",
  affiliate_link: "",
};

export function getAffiliateProductFormValues(product) {
  if (!product) return AFFILIATE_PRODUCT_INITIAL_VALUES;

  return {
    provider: product.provider || "amazon",
    title: product.title ?? "",
    description: product.description ?? "",
    image_url: product.image_url ?? "",
    product_link: product.product_link ?? "",
    affiliate_link: product.affiliate_link ?? "",
  };
}
