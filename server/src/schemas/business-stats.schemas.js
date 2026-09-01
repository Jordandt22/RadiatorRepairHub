import * as Yup from "yup";

export const BUSINESS_STAT_EVENTS = [
  "impression",
  "listing_click",
  "page_view",
  "phone_click",
  "directions_click",
  "website_click",
  "email_click",
];

export const BUSINESS_STAT_SOURCES = [
  "search",
  "featured",
  "top_verified",
  "state",
  "city",
  "category",
  "nearby",
];

const LIST_EVENTS = new Set(["impression", "listing_click"]);

export const CreateBusinessStatEventSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
  event: Yup.string()
    .oneOf(BUSINESS_STAT_EVENTS, "Invalid event")
    .required(),
  source: Yup.string()
    .oneOf(BUSINESS_STAT_SOURCES, "Invalid source")
    .nullable()
    .when("event", {
      is: (event) => LIST_EVENTS.has(event),
      then: (schema) => schema.required("Source is required"),
      otherwise: (schema) => schema.strip(),
    }),
  position: Yup.number()
    .integer()
    .min(1)
    .max(10000)
    .nullable()
    .when("event", {
      is: "impression",
      then: (schema) => schema.required("Position is required"),
      otherwise: (schema) => schema.strip(),
    }),
});
