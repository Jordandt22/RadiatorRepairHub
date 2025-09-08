import * as Yup from "yup";

// ---- Params Request ----

// ID Schema
export const IDSchema = Yup.object({
  id: Yup.string().trim().min(1).max(150).required(),
});

// ---- Body Request ----
