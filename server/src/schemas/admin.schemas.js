import * as Yup from "yup";

export const LoginAdminSchema = Yup.object({
  password: Yup.string().trim().required("Password is required"),
});

export const CONTACT_MESSAGE_STATUSES = [
  "pending",
  "sent",
  "declined",
  "no_response",
  "approved",
  "flagged",
];

export const UpdateContactMessagesStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(CONTACT_MESSAGE_STATUSES, "Invalid status")
    .required("Status is required"),
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const SendContactMessagesSchema = Yup.object({
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .max(5, "At most 5 contact messages can be sent at once")
    .required("Contact message IDs are required"),
});

export const UpdateContactMessagesArchivedSchema = Yup.object({
  archived: Yup.boolean().required("Archived is required"),
  contact_message_ids: Yup.array()
    .of(Yup.string().uuid("Invalid contact message ID").required())
    .min(1, "At least one contact message ID is required")
    .required("Contact message IDs are required"),
});

export const GetContactMessagesQuerySchema = Yup.object({
  page: Yup.number().min(1).max(100).required(),
  limit: Yup.number().min(1).max(30).required(),
  status: Yup.string()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .oneOf([...CONTACT_MESSAGE_STATUSES, null], "Invalid status")
    .optional(),
  archived: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return false;
      if (originalValue === "true" || originalValue === true) return true;
      if (originalValue === "false" || originalValue === false) return false;
      return value;
    })
    .default(false)
    .optional(),
});

export const CACHE_INVALIDATE_RESOURCES = ["contact-messages"];

export const InvalidateCacheSchema = Yup.object({
  resource: Yup.string()
    .oneOf(CACHE_INVALIDATE_RESOURCES, "Invalid cache resource")
    .required("Resource is required"),
});
