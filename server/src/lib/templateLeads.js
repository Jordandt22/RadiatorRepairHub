import { createHash } from "node:crypto";

/** Demo shop name for the siteId path. Lead mail uses the partner listing, not this registry. */
export const TEMPLATE_SITES = {
  "iron-bay-demo": {
    siteId: "iron-bay-demo",
    shopName: "Iron Bay Auto Repair",
  },
};

export const TEMPLATE_LEAD_DUPLICATE_SECONDS = 120;
export const TEMPLATE_LEAD_RATE_MAX = 5;
export const TEMPLATE_LEAD_RATE_WINDOW_SECONDS = 600;

export function getTemplateSite(siteId) {
  if (typeof siteId !== "string") return null;
  return TEMPLATE_SITES[siteId.trim()] ?? null;
}

/** A filled honeypot means the submission is dropped and reported as success. */
export function isTemplateLeadHoneypotFilled(company) {
  return typeof company === "string" && company.trim().length > 0;
}

export function templateLeadDuplicateKey({ siteId, businessId, email, phone, issue }) {
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const identity = trimmedEmail
    ? `e:${trimmedEmail}`
    : `p:${String(phone ?? "").replace(/\D/g, "")}`;
  const issueNorm = String(issue ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
  const scope = String(businessId || siteId || "").trim();
  const digest = createHash("sha256")
    .update(`${scope}\n${identity}\n${issueNorm}`)
    .digest("hex")
    .slice(0, 32);
  return `TEMPLATE_LEAD_DUP:${digest}`;
}

export function templateLeadRateKey(ip) {
  const safe = String(ip ?? "unknown")
    .replace(/^::ffff:/, "")
    .replace(/[^a-zA-Z0-9.:_-]/g, "")
    .slice(0, 80);
  return `TEMPLATE_LEAD_RATE:${safe || "unknown"}`;
}
