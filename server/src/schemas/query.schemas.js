import * as Yup from "yup";

// ---- Query Params ----

// Pagination Query Schema
export const paginationSchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
});
