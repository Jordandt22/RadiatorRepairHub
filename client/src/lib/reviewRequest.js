export const FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT = 20;

export function googleReviewUrl(placeId) {
  const id = typeof placeId === "string" ? placeId.trim() : "";
  if (!id) return "";
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

export function reviewEmailSubject(shopTitle) {
  const shop =
    typeof shopTitle === "string" && shopTitle.trim()
      ? shopTitle.trim()
      : "your shop";
  return `How was your visit to ${shop}?`;
}
