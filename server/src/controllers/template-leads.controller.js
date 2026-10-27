import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { verifyEmailReputation } from "../abstract/emailReputation.js";
import { resendClient } from "../resend/resend.js";
import { formatReviewFromAddress } from "../lib/reviewRequest.js";
import { getWebBaseUrl } from "../lib/constants/messages.js";
import {
  buildCustomerLeadEmailHtml,
  buildOwnerLeadEmailHtml,
  publicReplyEmail,
} from "../lib/templateLeadEmail.js";
import { resolveNotificationRecipient } from "../lib/notificationRecipient.js";
import { isFixedBrowserOrigin } from "../lib/partnerSiteCors.js";
import { allowedOriginsForDomain } from "../lib/partnerSiteDomain.js";
import { supabase, adminAuthClient } from "../supabase/supabase.js";
import {
  TEMPLATE_LEAD_DUPLICATE_SECONDS,
  TEMPLATE_LEAD_RATE_MAX,
  TEMPLATE_LEAD_RATE_WINDOW_SECONDS,
  isTemplateLeadHoneypotFilled,
  templateLeadDuplicateKey,
  templateLeadRateKey,
} from "../lib/templateLeads.js";
import {
  checkKey,
  getCacheData,
  redisClient,
  setWithExactTtl,
} from "../redis/redis.js";
import { logger } from "../lib/logger.js";

const { ROUTE_NOT_FOUND, YUP_ERROR, SERVER_ERROR, TOO_MANY_REQUESTS } =
  errorCodes;

const SUCCESS_MESSAGE =
  "Thanks! We received your message and will get back to you soon.";

function clientIp(req) {
  const raw = req.ip ?? req.socket?.remoteAddress ?? "unknown";
  return String(raw);
}

async function allowTemplateLeadRate(ip) {
  const key = checkKey(templateLeadRateKey(ip));
  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, TEMPLATE_LEAD_RATE_WINDOW_SECONDS);
    }
    return count <= TEMPLATE_LEAD_RATE_MAX;
  } catch (error) {
    logger.warn({ err: error }, "Template lead rate limit skipped");
    return true;
  }
}

/** True when this lead was already accepted inside the duplicate window. */
async function isDuplicateTemplateLead(parts) {
  const key = templateLeadDuplicateKey(parts);
  try {
    const existing = await getCacheData(key);
    return Boolean(existing?.data);
  } catch (error) {
    logger.warn({ err: error }, "Template lead duplicate check skipped");
    return false;
  }
}

async function rememberTemplateLead(parts) {
  try {
    await setWithExactTtl(
      templateLeadDuplicateKey(parts),
      TEMPLATE_LEAD_DUPLICATE_SECONDS,
      true
    );
  } catch (error) {
    logger.warn({ err: error }, "Template lead duplicate window not stored");
  }
}

function relationField(value, key) {
  const row = Array.isArray(value) ? value[0] : value;
  const field = row?.[key];
  return typeof field === "string" ? field.trim() : "";
}

async function ownerAuthEmail(ownerUid) {
  try {
    const { data, error } = await adminAuthClient.getUserById(ownerUid);
    if (error || !data?.user?.email) return null;
    return data.user.email;
  } catch (error) {
    logger.warn({ err: error }, "Template lead owner email lookup failed");
    return null;
  }
}

function siteKeyFromRequest(req) {
  const header = req.get("x-site-key");
  return typeof header === "string" ? header.trim() : "";
}

function originAllowedForSite(req, domain) {
  const origin = req.get("origin");
  if (!origin) return true;
  if (isFixedBrowserOrigin(origin)) return true;
  return allowedOriginsForDomain(domain).includes(origin);
}

/** Partner listing selected by X-Site-Key. */
async function resolveLeadTarget(req) {
  const siteKey = siteKeyFromRequest(req);
  if (siteKey) {
    const { data, error } = await supabase
      .from("partner_sites")
      .select(
        "domain, businesses!inner(id, title, email, phone, address, timezone, notification_email, is_claimed, is_partner, owner_uid, city:cities(name), state:states(code), postal_code:postal_codes(code), hours:business_hours(day_of_week, is_closed, hours, hours_text))"
      )
      .eq("api_key", siteKey)
      .maybeSingle();
    if (error) {
      logger.error({ err: error }, "Template lead site key lookup failed");
      return { error: true };
    }
    const business = data?.businesses;
    if (
      !business?.is_claimed ||
      !business.is_partner ||
      !business.owner_uid ||
      !business.title ||
      !data.domain
    ) {
      return null;
    }
    if (!originAllowedForSite(req, data.domain)) {
      return { originDenied: true };
    }
    const ownerEmail = resolveNotificationRecipient(
      business,
      await ownerAuthEmail(business.owner_uid)
    );
    if (!ownerEmail) {
      return { missingInbox: true, shopName: business.title };
    }
    return {
      persist: true,
      businessId: business.id,
      shopName: business.title,
      ownerEmail,
      duplicateScope: business.id,
      domain: data.domain,
      phone: business.phone,
      address: business.address,
      cityName: relationField(business.city, "name"),
      stateCode: relationField(business.state, "code"),
      postalCode: relationField(business.postal_code, "code"),
      publicEmail: business.email,
      timezone: business.timezone,
      hours: Array.isArray(business.hours) ? business.hours : [],
    };
  }

  return null;
}

async function insertWebsiteLead(target, lead) {
  const { error } = await supabase.from("website_leads").insert({
    business_id: target.businessId,
    customer_name: lead.name,
    customer_phone: lead.phone,
    customer_email: lead.email || null,
    service: lead.service,
    vehicle: lead.vehicle,
    issue: lead.issue,
    status: "new",
  });
  if (error) {
    logger.error(
      { err: error, businessId: target.businessId },
      "Template lead row was not saved"
    );
    return { ok: false, error };
  }
  return { ok: true };
}

export const createTemplateLead = async (req, res) => {
  if (isTemplateLeadHoneypotFilled(req.body.company)) {
    return res.status(200).json(successHandler({ message: SUCCESS_MESSAGE }));
  }

  const target = await resolveLeadTarget(req);
  if (target?.originDenied) {
    return res
      .status(403)
      .json(customErrorHandler(errorCodes.ACCESS_DENIED, "Unknown site."));
  }
  if (target?.error) {
    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Couldn't send your message. Please call the shop or try again."
        )
      );
  }
  if (!target) {
    return res
      .status(404)
      .json(customErrorHandler(ROUTE_NOT_FOUND, "Unknown site."));
  }
  if (target.missingInbox) {
    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Couldn't send your message. Please call the shop or try again."
        )
      );
  }
  const site = {
    shopName: target.shopName,
    domain: target.domain,
    phone: target.phone,
    address: target.address,
    cityName: target.cityName,
    stateCode: target.stateCode,
    postalCode: target.postalCode,
    publicEmail: target.publicEmail,
    timezone: target.timezone,
    hours: target.hours,
    dashboardUrl: `${getWebBaseUrl()}/dashboard?tab=automation&section=lead&business=${encodeURIComponent(target.businessId)}`,
  };

  const allowed = await allowTemplateLeadRate(clientIp(req));
  if (!allowed) {
    return res
      .status(429)
      .json(
        customErrorHandler(
          TOO_MANY_REQUESTS,
          "Too many requests have been sent. Please try again later."
        )
      );
  }

  const lead = {
    name: req.body.name.trim(),
    phone: req.body.phone.trim(),
    email: req.body.email?.trim() || "",
    service: req.body.service.trim(),
    vehicle: req.body.vehicle.trim(),
    issue: req.body.issue.trim(),
  };

  const duplicateParts = {
    siteId: target.duplicateScope,
    businessId: target.persist ? target.businessId : undefined,
    email: lead.email,
    phone: lead.phone,
    issue: lead.issue,
  };

  if (await isDuplicateTemplateLead(duplicateParts)) {
    return res.status(200).json(successHandler({ message: SUCCESS_MESSAGE }));
  }

  if (lead.email) {
    const emailCheck = await verifyEmailReputation(lead.email);
    if (!emailCheck.ok) {
      const { error: verifyError } = emailCheck;
      if (verifyError.type === "undeliverable") {
        return res.status(422).json(
          customErrorHandler(YUP_ERROR, {
            email: verifyError.message,
          })
        );
      }
      return res
        .status(503)
        .json(
          customErrorHandler(
            SERVER_ERROR,
            verifyError.message || "Unable to verify email address right now.",
            verifyError.cause
          )
        );
    }
  }

  const { SENDER_EMAIL, RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(503)
      .json(
        customErrorHandler(SERVER_ERROR, "Email sending is not configured.")
      );
  }

  // Persist before email so a Resend outage cannot "succeed" without a dashboard lead.
  // Duplicate key is set only after the owner email succeeds so a failed notify can retry.
  if (target.persist) {
    const saved = await insertWebsiteLead(target, lead);
    if (!saved.ok) {
      return res
        .status(503)
        .json(
          customErrorHandler(
            SERVER_ERROR,
            "Couldn't send your message. Please call the shop or try again."
          )
        );
    }
  }

  const from = formatReviewFromAddress(site.shopName, SENDER_EMAIL);
  const ownerPayload = {
    from,
    to: [target.ownerEmail],
    subject: `New website lead for ${site.shopName}`,
    html: buildOwnerLeadEmailHtml(site, lead),
  };
  if (lead.email) ownerPayload.replyTo = lead.email;

  const { error: ownerError } = await resendClient().emails.send(ownerPayload);
  if (ownerError) {
    logger.error(
      {
        err: ownerError,
        businessId: target.businessId,
        ownerEmail: target.ownerEmail,
      },
      "Template lead owner email failed"
    );
    return res
      .status(503)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Couldn't send your message. Please call the shop or try again."
        )
      );
  }

  await rememberTemplateLead(duplicateParts);

  if (lead.email) {
    const confirmPayload = {
      from,
      to: [lead.email],
      subject: `We received your request for ${site.shopName}`,
      html: buildCustomerLeadEmailHtml(site, lead),
    };
    const shopReplyEmail = publicReplyEmail(site.publicEmail);
    if (shopReplyEmail) confirmPayload.replyTo = shopReplyEmail;
    const { error: confirmError } = await resendClient().emails.send(confirmPayload);
    if (confirmError) {
      // Confirmation is best-effort: the shop already has the lead and notification.
      logger.error(
        {
          err: confirmError,
          businessId: target.businessId,
          customerEmail: lead.email,
        },
        "Template lead confirmation email failed"
      );
    }
  }

  return res.status(201).json(successHandler({ message: SUCCESS_MESSAGE }));
};
