import * as Yup from "yup";

// ---- Params Request ----

// State ID Schema
export const StateIDSchema = Yup.object({
  state_id: Yup.string().trim().min(1).max(150).required(),
});

// City ID Schema
export const CityIDSchema = Yup.object({
  city_id: Yup.string().trim().min(1).max(150).required(),
});

// ---- Body Request ----
