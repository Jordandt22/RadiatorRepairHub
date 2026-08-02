import * as Yup from "yup";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const GetPublicAffiliateProductsQuerySchema = Yup.object({
  ids: Yup.string()
    .trim()
    .required("ids is required")
    .test("valid-ids", "ids must be a comma-separated list of UUIDs", (value) => {
      if (!value) return false;
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0 || parts.length > 20) return false;
      return parts.every((id) => UUID_REGEX.test(id));
    }),
});
