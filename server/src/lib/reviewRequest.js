export const FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT = 20;
export const REVIEW_EMAILS_PER_CUSTOMER_PER_MONTH = 2;

export function isCustomerReviewSendBlocked(sentToCustomerThisMonth) {
  return (
    (Number(sentToCustomerThisMonth) || 0) >=
    REVIEW_EMAILS_PER_CUSTOMER_PER_MONTH
  );
}
const FALLBACK_TIME_ZONE = "America/Los_Angeles";

export function resolveTimeZone(timeZone) {
  if (typeof timeZone !== "string" || !timeZone.trim()) {
    return FALLBACK_TIME_ZONE;
  }
  const trimmed = timeZone.trim();
  try {
    Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(new Date());
    return trimmed;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const read = (type) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** UTC instant for local year-month-01 00:00:00 in timeZone. */
function startOfMonth(timeZone, year, month) {
  const zone = resolveTimeZone(timeZone);
  let utc = Date.UTC(year, month - 1, 1, 0, 0, 0);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const local = zonedParts(new Date(utc), zone);
    const asUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second
    );
    const target = Date.UTC(year, month - 1, 1, 0, 0, 0);
    const delta = asUtc - target;
    if (delta === 0) break;
    utc -= delta;
  }
  return new Date(utc);
}

export function zonedMonthStart(timeZone, now = new Date()) {
  const zone = resolveTimeZone(timeZone);
  const { year, month } = zonedParts(now, zone);
  return startOfMonth(zone, year, month);
}

export function nextZonedMonthStart(timeZone, now = new Date()) {
  const zone = resolveTimeZone(timeZone);
  const { year, month } = zonedParts(now, zone);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return startOfMonth(zone, nextYear, nextMonth);
}

export function googleReviewUrl(placeId) {
  const id = typeof placeId === "string" ? placeId.trim() : "";
  if (!id) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
}

export function defaultReviewMessageTemplate(shopTitle) {
  const shop =
    typeof shopTitle === "string" && shopTitle.trim()
      ? shopTitle.trim()
      : "the shop";
  return `Hi {name}, thank you for coming into ${shop}, we hope you had a great experience! If you have a moment, we'd love if you could leave a review. Takes less than a minute and it means the world for our local shop!`;
}

export function applyReviewMessageTemplate(template, customerName) {
  const source = typeof template === "string" ? template : "";
  const name = typeof customerName === "string" ? customerName.trim() : "";
  return source
    .replaceAll("{name}", name)
    .replace(/^Hi\s*,/, "Hi,")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function reviewMessageToTemplate(message, customerName) {
  const text = typeof message === "string" ? message.trim() : "";
  const name = typeof customerName === "string" ? customerName.trim() : "";
  if (name.length < 2) return text;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`\\b${escaped}\\b`, "g"), "{name}");
}

export function defaultReviewMessage({ customerName, shopTitle } = {}) {
  return applyReviewMessageTemplate(
    defaultReviewMessageTemplate(shopTitle),
    customerName
  );
}

export function formatReviewFromAddress(shopTitle, senderEmail) {
  const raw =
    typeof shopTitle === "string" && shopTitle.trim()
      ? shopTitle.trim()
      : "RadiatorRepairHub";
  const name = raw.replace(/[\r\n]+/g, " ");
  const escaped = name.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}" <${senderEmail}>`;
}

export function reviewEmailSubject(shopTitle) {
  const shop =
    typeof shopTitle === "string" && shopTitle.trim()
      ? shopTitle.trim()
      : "your shop";
  return `How was your visit to ${shop}?`.slice(0, 200);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function reviewShopTitle(shopTitle) {
  return typeof shopTitle === "string" && shopTitle.trim()
    ? shopTitle.trim()
    : "this shop";
}

export function reviewSentByLine(shopTitle) {
  return `Sent by RadiatorRepairHub on behalf of ${reviewShopTitle(shopTitle)}.`;
}

export function reviewUnsubscribeLine(shopTitle) {
  return `You can unsubscribe from review emails for ${reviewShopTitle(shopTitle)}.`;
}

export function buildReviewEmailHtml({
  message,
  reviewUrl,
  shopTitle,
  unsubscribeUrl,
}) {
  const body = typeof message === "string" ? message.trim() : "";
  const url = typeof reviewUrl === "string" ? reviewUrl.trim() : "";
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`
    )
    .join("");
  const link = url
    ? `<p><a href="${escapeHtml(url)}">Leave a Google review</a></p>`
    : "";
  const unsubscribe = typeof unsubscribeUrl === "string" ? unsubscribeUrl.trim() : "";
  const unsubscribeLink = unsubscribe
    ? ` <a href="${escapeHtml(unsubscribe)}">Unsubscribe</a>`
    : "";
  const footer = `<p>${escapeHtml(reviewSentByLine(shopTitle))}</p><p>${escapeHtml(reviewUnsubscribeLine(shopTitle))}${unsubscribeLink}</p>`;
  return `${paragraphs}${link}${footer}`;
}

export function reviewEmailUsage({ isPartner, sentThisMonth }) {
  const sent = Number(sentThisMonth) || 0;
  if (isPartner) {
    return {
      sentThisMonth: sent,
      limit: null,
      unlimited: true,
    };
  }
  return {
    sentThisMonth: sent,
    limit: FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT,
    unlimited: false,
  };
}

export function isReviewSendBlocked(usage) {
  if (!usage || usage.unlimited) return false;
  return usage.sentThisMonth >= usage.limit;
}
