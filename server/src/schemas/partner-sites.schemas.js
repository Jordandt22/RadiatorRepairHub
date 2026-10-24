import * as Yup from "yup";
import { normalizePartnerDomain } from "../lib/partnerSiteDomain.js";

export const PartnerSiteParamsSchema = Yup.object({
  businessId: Yup.string().trim().uuid("Invalid business ID").required(),
});

export const UpdatePartnerSiteSchema = Yup.object({
  domain: Yup.string()
    .trim()
    .required("Enter a domain")
    .test("partner-domain", "Enter a domain like ironbayradiator.com", (value) =>
      Boolean(normalizePartnerDomain(value))
    ),
  generateKey: Yup.boolean().default(false),
});
