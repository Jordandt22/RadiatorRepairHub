import {
  normalizeIncomingHours,
  parseTimeToMinutes,
} from "./businessHoursFormat.js";

const MAX_TEXT = 2000;
const MAX_SHORT = 320;
const MAX_URL = 500;
const MIN_SERVICES = 4;
const MAX_SERVICES = 20;
const MIN_IMAGES = 4;
const MAX_IMAGES = 10;
const PRIORITY_DAYS = 7;

function defaultHoursWeek() {
  return normalizeIncomingHours([]);
}

function isHoursUnset(hours) {
  if (hours == null) return true;
  if (typeof hours === "string") return true;
  if (!Array.isArray(hours) || hours.length === 0) return true;
  return false;
}

/** Normalize + validate 7-day open/close schedule. Max 2 non-overlapping periods/day. */
export function normalizeIntakeHours(rawHours) {
  const days = normalizeIncomingHours(
    Array.isArray(rawHours) ? rawHours : []
  );
  const errors = {};

  for (const day of days) {
    if (day.is_closed) continue;
    if (!day.hours?.length) {
      errors[`hours.${day.day_of_week}`] =
        "Add at least one open/close time, or mark closed.";
      continue;
    }

    let dayInvalid = false;
    for (const period of day.hours) {
      const open = parseTimeToMinutes(period.open);
      const close = parseTimeToMinutes(period.close);
      if (open == null || close == null || close <= open) {
        errors[`hours.${day.day_of_week}`] =
          "Close time must be after open time.";
        dayInvalid = true;
        break;
      }
    }
    if (dayInvalid) continue;

    if (day.hours.length === 2) {
      const firstClose = parseTimeToMinutes(day.hours[0].close);
      const secondOpen = parseTimeToMinutes(day.hours[1].open);
      if (
        firstClose != null &&
        secondOpen != null &&
        secondOpen < firstClose
      ) {
        errors[`hours.${day.day_of_week}`] =
          "Second period must start after the first period ends.";
      }
    }
  }

  if (Object.keys(errors).length) {
    errors.hours = "Fix the hours for each highlighted day.";
  }

  return { hours: days, errors };
}

const MIN_PROCESS_STEPS = 0;
const MAX_PROCESS_STEPS = 5;

export const DEFAULT_NEW_CUSTOMER_PROCESS_STEPS = [
  "Tell us what the car is doing (year, make, and the symptom).",
  "We diagnose and show you what we found.",
  "You approve the estimate before we start.",
  "We complete the repair and check it before you leave.",
];

/** @deprecated Use DEFAULT_NEW_CUSTOMER_PROCESS_STEPS */
export const DEFAULT_NEW_CUSTOMER_PROCESS =
  DEFAULT_NEW_CUSTOMER_PROCESS_STEPS.map((step, i) => `${i + 1}. ${step}`).join(
    "\n"
  );

function parseNewCustomerProcessSteps(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return trimString(item, 500);
        if (item && typeof item === "object") {
          return trimString(item.text ?? item.step ?? "", 500);
        }
        return "";
      })
      .filter(Boolean)
      .slice(0, MAX_PROCESS_STEPS);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\r?\n/)
      .map((line) =>
        trimString(line.replace(/^\s*\d+[\.)]\s*/, ""), 500)
      )
      .filter(Boolean)
      .slice(0, MAX_PROCESS_STEPS);
  }
  return null;
}

/** Empty / missing → generic defaults. Explicit empty array stays empty until save applies defaults. */
function normalizeNewCustomerProcess(raw, { applyDefaultIfEmpty = true } = {}) {
  const parsed = parseNewCustomerProcessSteps(raw);
  let steps = parsed;
  if (steps == null) {
    steps = applyDefaultIfEmpty ? [...DEFAULT_NEW_CUSTOMER_PROCESS_STEPS] : [];
  } else if (!steps.length && applyDefaultIfEmpty) {
    steps = [...DEFAULT_NEW_CUSTOMER_PROCESS_STEPS];
  }
  return steps.map((text) => ({ text }));
}

function trimString(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function asBool(value, fallback = true) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isHexColor(value) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

function normalizeMedia(value) {
  if (!value || typeof value !== "object") return null;
  const imageId = trimString(value.imageId, 120);
  const url = trimString(value.url, MAX_URL);
  if (!imageId || !url) return null;
  const caption = trimString(value.caption, 120);
  return caption ? { imageId, url, caption } : { imageId, url, caption: "" };
}

function normalizeServices(list) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, MAX_SERVICES)
    .map((item) => ({
      name: trimString(item?.name, 120),
      description: trimString(item?.description, 500),
    }))
    .filter((item) => item.name || item.description);
}

export const DEFAULT_FAQ_ITEMS = [
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "Walk-ins are welcome. If every bay is full we will still look at it and tell you when we can pull it in. Diagnostics and brake jobs are usually the same day or the next morning. Bigger jobs get a finish time before we keep the car.",
  },
  {
    question: "How do you decide what to repair?",
    answer:
      "We test first and show you what we found. You get a price before we start. If the job grows, we call before we keep going.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring the vehicle, plus the year, make, and what it is doing. If a light is on, leave it on. A previous estimate helps if you have one. You do not need a diagnosis.",
  },
  {
    question: "Do you work on cars and light trucks?",
    answer:
      "Yes. Daily drivers and light trucks, domestic and import. We do not do bodywork, paint, or heavy diesel. If a job is outside the shop, we say so before we take it in.",
  },
  {
    question: "Is the work under warranty?",
    answer:
      "12-month workmanship on our labor. Parts carry the manufacturer's warranty. Ask at pickup if you want the labor warranty in writing.",
  },
];

function normalizeFaq(list) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, 12)
    .map((item) => ({
      question: trimString(item?.question, 300),
      answer: trimString(item?.answer, MAX_TEXT),
    }))
    .filter((item) => item.question || item.answer);
}

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
];

function emptySocialsObject() {
  return Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [platform, ""]));
}

/** Accepts object map or [{ platform, url }] rows. Always returns the map shape. */
export function normalizeSocials(value) {
  const out = emptySocialsObject();
  let hasDuplicate = false;

  if (Array.isArray(value)) {
    for (const item of value) {
      const platform = trimString(item?.platform, 40).toLowerCase();
      if (!SOCIAL_PLATFORMS.includes(platform)) continue;
      if (out[platform]) {
        hasDuplicate = true;
        continue;
      }
      out[platform] = trimString(item?.url, MAX_URL);
    }
  } else if (value && typeof value === "object") {
    for (const platform of SOCIAL_PLATFORMS) {
      out[platform] = trimString(value[platform], MAX_URL);
    }
  }

  return { socials: out, hasDuplicate };
}

export function partnerIntakePriorityUntil(from = new Date()) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + PRIORITY_DAYS);
  return date.toISOString();
}

export function isPartnerIntakePriorityActive(priorityUntil, status) {
  if (status === "submitted") return false;
  if (!priorityUntil) return false;
  return new Date(priorityUntil).getTime() > Date.now();
}

export function emptyPartnerWebsiteIntakePayload() {
  return {
    name: "",
    googleMapsUrl: "",
    publicEmail: "",
    publicPhone: "",
    preferredEmail: "",
    preferredPhone: "",
    sameAsPublic: true,
    hours: defaultHoursWeek(),
    walkIns: true,
    appointments: true,
    preferredDomain: "",
    logo: null,
    images: [],
    description: "",
    yearsOfService: "",
    services: Array.from({ length: MIN_SERVICES }, () => ({
      name: "",
      description: "",
    })),
    newCustomerProcess: DEFAULT_NEW_CUSTOMER_PROCESS_STEPS.map((text) => ({
      text,
    })),
    theme: "dark",
    accentColor: "",
    socials: emptySocialsObject(),
    faq: DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
    extraNotes: "",
  };
}

/** Merge listing snapshot into empty draft fields only. */
export function applyListingPrefill(payload, listing) {
  const source = payload && typeof payload === "object" ? payload : {};
  const next = { ...emptyPartnerWebsiteIntakePayload(), ...source };
  if (isHoursUnset(source.hours)) {
    next.hours = normalizeIncomingHours(listing?.hoursDays || []);
  } else {
    next.hours = normalizeIncomingHours(source.hours);
  }
  if (!listing) return next;
  if (!next.name) next.name = trimString(listing.title, 200);
  if (!next.googleMapsUrl) next.googleMapsUrl = trimString(listing.googleMapsUrl, MAX_URL);
  if (!next.publicEmail) next.publicEmail = trimString(listing.email, MAX_SHORT).toLowerCase();
  if (!next.publicPhone) next.publicPhone = trimString(listing.phone, 40);
  if (next.sameAsPublic) {
    if (!next.preferredEmail) next.preferredEmail = next.publicEmail;
    if (!next.preferredPhone) next.preferredPhone = next.publicPhone;
  }
  if (Object.prototype.hasOwnProperty.call(source, "newCustomerProcess")) {
    next.newCustomerProcess = normalizeNewCustomerProcess(
      source.newCustomerProcess,
      { applyDefaultIfEmpty: false }
    );
  } else {
    next.newCustomerProcess = normalizeNewCustomerProcess(undefined, {
      applyDefaultIfEmpty: true,
    });
  }
  if (!Array.isArray(next.services) || next.services.length < MIN_SERVICES) {
    const services = normalizeServices(next.services);
    while (services.length < MIN_SERVICES) {
      services.push({ name: "", description: "" });
    }
    next.services = services;
  }
  return next;
}

export function normalizeStep1(body = {}, { soft = false } = {}) {
  const sameAsPublic = asBool(body.sameAsPublic, true);
  const publicEmail = trimString(body.publicEmail, MAX_SHORT).toLowerCase();
  const publicPhone = trimString(body.publicPhone, 40);
  const hoursResult = soft
    ? {
        hours: normalizeIncomingHours(
          Array.isArray(body.hours) ? body.hours : []
        ),
        errors: {},
      }
    : normalizeIntakeHours(body.hours);
  const payload = {
    name: trimString(body.name, 200),
    googleMapsUrl: trimString(body.googleMapsUrl, MAX_URL),
    publicEmail,
    publicPhone,
    preferredEmail: sameAsPublic
      ? publicEmail
      : trimString(body.preferredEmail, MAX_SHORT).toLowerCase(),
    preferredPhone: sameAsPublic
      ? publicPhone
      : trimString(body.preferredPhone, 40),
    sameAsPublic,
    hours: hoursResult.hours,
    walkIns: asBool(body.walkIns, true),
    appointments: asBool(body.appointments, true),
  };

  const errors = { ...hoursResult.errors };
  if (!soft) {
    if (!payload.name) errors.name = "Enter the business name.";
    if (!payload.googleMapsUrl) {
      errors.googleMapsUrl = "Enter a Google Maps link.";
    }
    if (!payload.publicPhone && !payload.publicEmail) {
      errors.publicPhone = "Enter a public phone or email.";
    }
    if (!payload.walkIns && !payload.appointments) {
      errors.walkIns = "Turn on walk-ins, appointments, or both.";
    }
  }
  if (payload.googleMapsUrl && !isHttpUrl(payload.googleMapsUrl)) {
    errors.googleMapsUrl = "Enter a valid http(s) URL.";
  }
  if (payload.publicEmail && !isEmail(payload.publicEmail)) {
    errors.publicEmail = "Enter a valid email address.";
  }
  if (payload.preferredEmail && !isEmail(payload.preferredEmail)) {
    errors.preferredEmail = "Enter a valid email address.";
  }

  return { payload, errors };
}

export const TOTAL_INTAKE_STEPS = 4;

export function normalizeStep2(
  body = {},
  { requireMedia = true, soft = false } = {}
) {
  const images = Array.isArray(body.images)
    ? body.images.map(normalizeMedia).filter(Boolean).slice(0, MAX_IMAGES)
    : [];
  const logo = normalizeMedia(body.logo);
  const payload = {
    preferredDomain: trimString(body.preferredDomain, 253),
    logo,
    images,
    description: trimString(body.description, MAX_TEXT),
    yearsOfService: trimString(String(body.yearsOfService ?? ""), 40),
    newCustomerProcess: normalizeNewCustomerProcess(body.newCustomerProcess, {
      applyDefaultIfEmpty: !soft,
    }),
  };

  const errors = {};
  if (!soft) {
    if (!payload.preferredDomain) {
      errors.preferredDomain = "Enter a preferred domain.";
    }
    if (!payload.description) {
      errors.description = "Enter a business description.";
    }
    if (!payload.yearsOfService) {
      errors.yearsOfService = "Enter years of service.";
    }
    if (requireMedia) {
      if (images.length < MIN_IMAGES) {
        errors.images = `Upload at least ${MIN_IMAGES} images.`;
      }
    }
  }

  return { payload, errors };
}

export function normalizeStep3(body = {}, { soft = false } = {}) {
  const services = normalizeServices(body.services);
  const payload = { services };

  const errors = {};
  if (!soft) {
    const namedServices = services.filter((s) => s.name);
    if (namedServices.length < MIN_SERVICES) {
      errors.services = `Add at least ${MIN_SERVICES} services with names.`;
    }
  }

  return { payload, errors };
}

export function normalizeStep4(body = {}) {
  const theme = body.theme === "light" ? "light" : "dark";
  const accentColor = trimString(body.accentColor, 32);
  const { socials, hasDuplicate } = normalizeSocials(body.socials);
  const faq = normalizeFaq(body.faq);
  const payload = {
    theme,
    accentColor,
    socials,
    faq,
    extraNotes: trimString(body.extraNotes, MAX_TEXT),
  };

  const errors = {};
  if (accentColor && !isHexColor(accentColor)) {
    errors.accentColor = "Use a hex color like #E31B16.";
  }
  if (hasDuplicate) {
    errors.socials = "Each social platform can only be added once.";
  }
  for (const [key, value] of Object.entries(socials)) {
    if (value && !isHttpUrl(value)) {
      errors[`socials.${key}`] = "Enter a valid http(s) URL.";
    }
  }
  for (const item of faq) {
    if (item.question && !item.answer) {
      errors.faq = "Add an answer for each FAQ question.";
      break;
    }
  }

  return { payload, errors };
}

export function mergeIntakePayload(existing, stepPayload) {
  return {
    ...emptyPartnerWebsiteIntakePayload(),
    ...(existing && typeof existing === "object" ? existing : {}),
    ...stepPayload,
  };
}

export function validateReadyToSubmit(payload) {
  const step1 = normalizeStep1(payload);
  const step2 = normalizeStep2(payload, { requireMedia: true });
  const step3 = normalizeStep3(payload);
  const step4 = normalizeStep4(payload);
  return {
    errors: {
      ...step1.errors,
      ...step2.errors,
      ...step3.errors,
      ...step4.errors,
    },
    payload: mergeIntakePayload(
      mergeIntakePayload(
        mergeIntakePayload(step1.payload, step2.payload),
        step3.payload
      ),
      step4.payload
    ),
  };
}

export function mapPartnerWebsiteIntake(
  row,
  listing = null,
  { mediaPayload = null } = {}
) {
  if (!row) {
    return {
      status: "needs_info",
      payload: applyListingPrefill(null, listing),
      currentStep: 1,
      startedAt: null,
      priorityUntil: null,
      priorityActive: false,
      reminder2dSentAt: null,
      mediaUsageConsented: false,
      mediaUsageConsentedAt: null,
      mediaUsageConsentVersion: null,
      submittedAt: null,
      updatedAt: null,
    };
  }

  const status = row.status === "submitted" ? "submitted" : "needs_info";
  const priorityUntil = row.priority_until ?? null;
  const rawPayload =
    row.payload && typeof row.payload === "object" ? row.payload : {};
  const basePayload =
    status === "submitted"
      ? rawPayload
      : applyListingPrefill(rawPayload, listing);
  const payload =
    mediaPayload && typeof mediaPayload === "object"
      ? {
          ...basePayload,
          logo: mediaPayload.logo ?? null,
          images: Array.isArray(mediaPayload.images)
            ? mediaPayload.images
            : [],
        }
      : basePayload;

  return {
    status,
    payload,
    currentStep: Math.min(
      TOTAL_INTAKE_STEPS,
      Math.max(1, Number(row.current_step) || 1)
    ),
    startedAt: row.started_at ?? null,
    priorityUntil,
    priorityActive: isPartnerIntakePriorityActive(priorityUntil, status),
    reminder2dSentAt: row.reminder_2d_sent_at ?? null,
    mediaUsageConsented: Boolean(row.media_usage_consented_at),
    mediaUsageConsentedAt: row.media_usage_consented_at ?? null,
    mediaUsageConsentVersion: row.media_usage_consent_version ?? null,
    submittedAt: row.submitted_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export const INTAKE_SELECT_FIELDS =
  "business_id, status, payload, current_step, started_at, priority_until, reminder_2d_sent_at, media_usage_consented_at, media_usage_consent_version, submitted_at, updated_at";

export {
  MIN_SERVICES,
  MAX_SERVICES,
  MIN_IMAGES,
  MAX_IMAGES,
  MIN_PROCESS_STEPS,
  MAX_PROCESS_STEPS,
  PRIORITY_DAYS,
};
