import { randomBytes } from "node:crypto";
import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import { clearPartnerSiteOriginCache } from "../../lib/partnerSiteCors.js";
import { resolveNotificationRecipient } from "../../lib/notificationRecipient.js";
import {
  allowedOriginsForDomain,
  normalizePartnerDomain,
} from "../../lib/partnerSiteDomain.js";
import { adminAuthClient, supabase } from "../../supabase/supabase.js";

const { ACCESS_DENIED, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

function createSiteKey() {
  return `rrh_${randomBytes(24).toString("base64url")}`;
}

const PARTNER_BUSINESS_FIELDS =
  "id, title, email, notification_email, is_claimed, is_partner, owner_uid";

async function accountEmailsByOwner(businesses) {
  const uids = [...new Set((businesses ?? []).map((business) => business.owner_uid).filter(Boolean))];
  const emails = new Map();
  await Promise.all(
    uids.map(async (uid) => {
      try {
        const { data, error } = await adminAuthClient.getUserById(uid);
        if (!error && data?.user?.email) emails.set(uid, data.user.email);
      } catch {
        // A missing auth user leaves the destination unresolved.
      }
    })
  );
  return emails;
}

function mapPartnerSite(business, site, accountEmail = null) {
  const domain = site?.domain || null;
  return {
    businessId: business.id,
    title: business.title,
    domain,
    allowedOrigins: allowedOriginsForDomain(domain),
    apiKey: site?.api_key || null,
    notificationEmail: resolveNotificationRecipient(business, accountEmail),
  };
}

export const listPartnerSitesHandler = async (req, res) => {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(PARTNER_BUSINESS_FIELDS)
    .eq("is_partner", true)
    .order("title", { ascending: true });

  if (error) {
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load partner sites.", error)
    );
  }

  const ids = (businesses ?? []).map((business) => business.id);
  let sites = [];
  if (ids.length) {
    const { data, error: siteError } = await supabase
      .from("partner_sites")
      .select("business_id, domain, api_key")
      .in("business_id", ids);
    if (siteError) {
      return res.status(500).json(
        customErrorHandler(SUPABASE_ERROR, "Unable to load partner sites.", siteError)
      );
    }
    sites = data ?? [];
  }

  const byId = new Map(sites.map((site) => [site.business_id, site]));
  const accountEmails = await accountEmailsByOwner(businesses);
  return res.status(200).json(
    successHandler({
      sites: (businesses ?? []).map((business) =>
        mapPartnerSite(
          business,
          byId.get(business.id),
          accountEmails.get(business.owner_uid) ?? null
        )
      ),
    })
  );
};

export const updatePartnerSiteHandler = async (req, res) => {
  const { businessId } = req.params;
  const domain = normalizePartnerDomain(req.body.domain);
  if (!domain) {
    return res
      .status(422)
      .json(customErrorHandler(YUP_ERROR, { domain: "Enter a domain like ironbayradiator.com" }));
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(PARTNER_BUSINESS_FIELDS)
    .eq("id", businessId)
    .maybeSingle();

  if (businessError) {
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load this listing.", businessError)
    );
  }
  if (!business?.is_partner) {
    return res
      .status(403)
      .json(customErrorHandler(ACCESS_DENIED, "Partner Sites are for partner listings."));
  }

  const { data: existing, error: existingError } = await supabase
    .from("partner_sites")
    .select("api_key")
    .eq("business_id", businessId)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load this partner site.", existingError)
    );
  }

  const generateKey = req.body.generateKey === true;
  const apiKey = generateKey ? createSiteKey() : existing?.api_key ?? null;
  const { error: saveError } = await supabase.from("partner_sites").upsert(
    {
      business_id: businessId,
      domain,
      api_key: apiKey,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" }
  );

  if (saveError) {
    if (saveError.code === "23505") {
      const detail = `${saveError.message || ""} ${saveError.details || ""}`;
      const field = /api_key/i.test(detail) ? "generateKey" : "domain";
      const message = /api_key/i.test(detail)
        ? "Could not generate a unique key. Try again."
        : "That domain is already connected to another listing.";
      return res.status(422).json(customErrorHandler(YUP_ERROR, { [field]: message }));
    }
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to save this partner site.", saveError)
    );
  }

  clearPartnerSiteOriginCache();
  const accountEmails = await accountEmailsByOwner([business]);
  return res.status(200).json(
    successHandler({
      site: mapPartnerSite(
        business,
        { domain, api_key: apiKey },
        accountEmails.get(business.owner_uid) ?? null
      ),
    })
  );
};
