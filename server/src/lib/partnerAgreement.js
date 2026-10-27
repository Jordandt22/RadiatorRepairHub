/** Partner agreement version logged at checkout. Bump when the public page text changes. */
export const PARTNER_AGREEMENT_VERSION = "partner_agreement_v0";

export const PARTNER_AGREEMENT_PATH = "/partner-agreement";

export function partnerAgreementUrl(baseUrl) {
  const origin = String(baseUrl || "").replace(/\/$/, "");
  return `${origin}${PARTNER_AGREEMENT_PATH}`;
}
