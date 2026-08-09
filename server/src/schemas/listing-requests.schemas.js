import * as Yup from "yup";
import { normalizeGoogleMapsUrl } from "../lib/normalizeGoogleMapsUrl.js";

const isValidOptionalPhone = (value) => {
  if (!value?.trim()) return true;

  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
};

const isGoogleMapsUrl = (value) => {
  if (!value?.trim()) return false;

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host === "maps.app.goo.gl" || host === "goo.gl") return true;
  if (host === "maps.google.com" || host.endsWith(".maps.google.com")) {
    return true;
  }
  if (host === "business.google.com" || host.endsWith(".business.google.com")) {
    return true;
  }
  if (host === "google.com" || host.endsWith(".google.com")) {
    return (
      path.includes("/maps") ||
      path.includes("/search") ||
      Boolean(parsed.searchParams.get("cid"))
    );
  }

  return false;
};

export const CreateListingRequestSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be 200 characters or fewer")
    .required("Business name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .test(
      "valid-phone",
      "Please enter a valid phone number",
      isValidOptionalPhone
    ),
  googleMapsUrl: Yup.string()
    .trim()
    .transform((value) => normalizeGoogleMapsUrl(value))
    .url("Please enter a valid Google Maps or Google Business link")
    .max(2000, "Link must be 2000 characters or fewer")
    .required("Google Maps or Google Business link is required")
    .test(
      "google-maps-url",
      "Please paste a Google Maps or Google Business Profile link",
      isGoogleMapsUrl
    ),
  message: Yup.string()
    .trim()
    .transform((value) => (value === "" || value == null ? null : value))
    .nullable()
    .notRequired()
    .max(5000, "Message must be 5000 characters or fewer")
    .test(
      "optional-min",
      "Message must be at least 10 characters when provided",
      (value) => value == null || value.length >= 10
    ),
});
