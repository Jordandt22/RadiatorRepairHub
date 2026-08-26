import * as Yup from "yup";

// ---- Query Params ----

// Pagination Schema
export const paginationSchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
});

export const FEATURED_SORT_VALUES = [
  "featured",
  "alpha",
  "most_reviews",
  "least_reviews",
  "highest_rating",
  "lowest_rating",
];

export const featuredBusinessesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100),
  limit: Yup.number().min(1).max(30),
  sort: Yup.string().oneOf(FEATURED_SORT_VALUES),
  q: Yup.string().max(100),
});
