import * as Yup from "yup";

const optionalUuid = Yup.string()
  .transform((value) => {
    if (value == null || String(value).trim() === "") return undefined;
    return String(value).trim();
  })
  .uuid("Invalid ID")
  .notRequired();

export const CreateSearchStatEventSchema = Yup.object({
  state_id: optionalUuid,
  city_id: optionalUuid,
  category_id: optionalUuid,
  zero_results: Yup.boolean().required(),
}).test({
  name: "at-least-one-dimension",
  test(value) {
    if (value?.state_id || value?.city_id || value?.category_id) return true;
    return this.createError({
      path: "state_id",
      message: "At least one of state_id, city_id, or category_id is required.",
    });
  },
});
