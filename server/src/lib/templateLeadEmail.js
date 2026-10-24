import { escapeHtml } from "./reviewRequest.js";
import { normalizePartnerDomain } from "./partnerSiteDomain.js";
import { WEEKDAYS, normalizeDayHours } from "./businessHoursFormat.js";

const LINK_STYLE = 'style="color: #1a73e8;"';

/** https:// page for a stored partner host. */
export function partnerSiteUrl(domain) {
  const host = normalizePartnerDomain(domain);
  return host ? `https://${host}` : null;
}

/** Public listing email safe to use as Reply-to. */
export function publicReplyEmail(email) {
  if (typeof email !== "string") return null;
  const value = email.trim();
  if (!/^[^\s<>"']+@[^\s<>"']+\.[^\s<>"']+$/.test(value)) return null;
  return value;
}

export function formatLeadSubmittedAt(date, timeZone) {
  const when = date instanceof Date ? date : new Date(date);
  const stamp = Number.isNaN(when.getTime()) ? new Date() : when;
  const format = (zone) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(stamp);
  const zone =
    typeof timeZone === "string" && timeZone.trim()
      ? timeZone.trim()
      : "America/Los_Angeles";
  try {
    return normalizeStamp(format(zone));
  } catch {
    return normalizeStamp(format("America/Los_Angeles"));
  }
}

/** Street on the first line, city and state on the second when they are not already in the street. */
export function formatShopAddress({
  address,
  cityName,
  stateCode,
  postalCode,
} = {}) {
  const street = text(address);
  const city = text(cityName);
  const state = text(stateCode);
  const zip = text(postalCode);
  const cityState = [city, state].filter(Boolean).join(", ");
  const locality = [cityState, zip].filter(Boolean).join(" ");
  if (
    street &&
    locality &&
    city &&
    street.toLowerCase().includes(city.toLowerCase())
  ) {
    return street;
  }
  return [street, locality].filter(Boolean).join("\n");
}

/** Monday through Sunday. Empty when the listing has no hours rows. */
export function formatShopHours(hours) {
  const rows = Array.isArray(hours) ? hours : [];
  if (!rows.length) return "";
  const byDay = new Map(
    rows
      .filter((row) => row && WEEKDAYS.includes(row.day_of_week))
      .map((row) => [row.day_of_week, row])
  );
  return WEEKDAYS.map((day) => {
    const row = byDay.get(day);
    const label = row ? dayHoursLabel(row) : "Closed";
    return `${day}: ${label}`;
  }).join("\n");
}

export function buildOwnerLeadEmailHtml(site, lead, submittedAt = new Date()) {
  const shopName = text(site?.shopName) || "your shop";
  const phone = text(lead?.phone);
  const email = text(lead?.email);
  const lines = [
    `<p>New lead submitted from the ${escapeHtml(shopName)} website.</p>`,
    labeled(
      "Submitted",
      escapeHtml(formatLeadSubmittedAt(submittedAt, site?.timezone))
    ),
    labeled("Name", plain(lead?.name)),
    labeled("Phone", phoneLink(phone)),
    labeled("Email", email ? mailLink(email) : "Not provided"),
    labeled("Service", plain(lead?.service)),
    labeled("Vehicle", plain(lead?.vehicle)),
    labeled("Message", plain(lead?.issue)),
  ];
  const websiteUrl = partnerSiteUrl(site?.domain) || safeHttpUrl(site?.websiteUrl);
  if (websiteUrl) {
    lines.push(
      `<p>Sent from ${anchor(websiteUrl, websiteUrl.replace(/^https:\/\//, ""))}.</p>`
    );
  }
  const dashboardUrl = safeHttpUrl(site?.dashboardUrl);
  if (dashboardUrl) {
    lines.push(`<p>${anchor(dashboardUrl, "Open this lead in your dashboard")}</p>`);
  }
  lines.push("<p>Thanks for partnering with RadiatorRepairHub.</p>");
  return lines.join("");
}

export function buildCustomerLeadEmailHtml(site, lead) {
  const shopName = text(site?.shopName) || "the shop";
  const name = text(lead?.name) || "there";
  const phone = text(site?.phone);
  const address = formatShopAddress(site);
  const email = publicReplyEmail(site?.publicEmail);
  const websiteUrl = partnerSiteUrl(site?.domain) || safeHttpUrl(site?.websiteUrl);
  const lines = [
    `<p>Hi ${escapeHtml(name)},</p>`,
    `<p>We received ${requestRecap(lead)} and sent it to ${escapeHtml(shopName)}. The shop will follow up with you.</p>`,
  ];
  if (phone) {
    lines.push("<p>Call the shop if you need them sooner.</p>");
  }
  const contact = [];
  if (phone) contact.push(labeled("Phone", phoneLink(phone)));
  if (address) contact.push(labeled("Address", plain(address)));
  const hours = formatShopHours(site?.hours);
  if (hours) contact.push(labeled("Hours", plain(hours)));
  if (email) contact.push(labeled("Email", mailLink(email)));
  if (websiteUrl) {
    contact.push(
      labeled("Website", anchor(websiteUrl, websiteUrl.replace(/^https:\/\//, "")))
    );
  }
  if (contact.length) {
    lines.push(`<p><strong>${escapeHtml(shopName)}</strong></p>`, ...contact);
  }
  lines.push(
    `<p>${escapeHtml(shopName)} is partnered with ${anchor("https://radiatorrepairhub.com", "RadiatorRepairHub")}.</p>`
  );
  return lines.join("");
}

function requestRecap(lead) {
  const service = text(lead?.service);
  const vehicle = text(lead?.vehicle);
  if (service && vehicle) {
    return `your request for ${escapeHtml(service)} on your ${escapeHtml(vehicle)}`;
  }
  if (service) return `your request for ${escapeHtml(service)}`;
  if (vehicle) return `your request about your ${escapeHtml(vehicle)}`;
  return "your request";
}

function labeled(label, valueHtml) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${valueHtml}</p>`;
}

function plain(value) {
  return escapeHtml(text(value)).replaceAll("\n", "<br>");
}

function anchor(href, label) {
  return `<a href="${escapeHtml(href)}" ${LINK_STYLE}>${escapeHtml(label)}</a>`;
}

function phoneLink(phone) {
  const href = telHref(phone);
  if (!href) return plain(phone);
  return anchor(href, phone);
}

function mailLink(email) {
  const href = mailtoHref(email);
  if (!href) return plain(email);
  return anchor(href, email);
}

function telHref(phone) {
  const raw = text(phone);
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  const normalized = digits.startsWith("+")
    ? `+${digits.slice(1).replaceAll("+", "")}`
    : digits.replaceAll("+", "");
  if (normalized.replaceAll("+", "").length < 7) return null;
  return `tel:${normalized}`;
}

function mailtoHref(email) {
  return publicReplyEmail(email) ? `mailto:${publicReplyEmail(email)}` : null;
}

function safeHttpUrl(value) {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!/^https?:\/\/[^\s<>"']+$/i.test(url)) return null;
  return url;
}

function dayHoursLabel(row) {
  const stored = text(row?.hours_text);
  if (stored) return stored;
  return normalizeDayHours(row).hours_text;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStamp(value) {
  return value.replaceAll("\u202f", " ").replaceAll("\u00a0", " ");
}
