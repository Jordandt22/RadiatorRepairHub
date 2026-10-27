const MAX_TEXT = 2000;
const MAX_SHORT = 320;

function trimString(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Normalize and validate owner intake payload for Partner website setup. */
export function normalizePartnerWebsiteIntakePayload(body = {}) {
  const payload = {
    preferredDomain: trimString(body.preferredDomain, 253),
    accentColor: trimString(body.accentColor, 32),
    about: trimString(body.about, MAX_TEXT),
    servicesNotes: trimString(body.servicesNotes, MAX_TEXT),
    hoursNotes: trimString(body.hoursNotes, MAX_TEXT),
    googleUrl: trimString(body.googleUrl, 500),
    logoPhotoNotes: trimString(body.logoPhotoNotes, MAX_TEXT),
    otherNotes: trimString(body.otherNotes, MAX_TEXT),
    contactEmail: trimString(body.contactEmail, MAX_SHORT).toLowerCase(),
  };

  const errors = {};
  if (payload.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) {
    errors.contactEmail = "Enter a valid email address.";
  }
  if (payload.accentColor && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(payload.accentColor)) {
    errors.accentColor = "Use a hex color like #E31B16.";
  }
  if (payload.googleUrl) {
    try {
      const url = new URL(payload.googleUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.googleUrl = "Enter a valid http(s) URL.";
      }
    } catch {
      errors.googleUrl = "Enter a valid URL.";
    }
  }

  const hasContent = Object.values(payload).some((value) => Boolean(value));
  if (!hasContent) {
    errors.form = "Add at least one detail before submitting.";
  }

  return { payload, errors };
}

export function mapPartnerWebsiteIntake(row) {
  if (!row) {
    return {
      status: "needs_info",
      payload: null,
      submittedAt: null,
      updatedAt: null,
    };
  }
  return {
    status: row.status === "submitted" ? "submitted" : "needs_info",
    payload: row.status === "submitted" ? row.payload ?? {} : null,
    submittedAt: row.submitted_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}
