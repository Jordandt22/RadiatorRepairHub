import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { supabase } from "../supabase/supabase.js";
import { getOwnedBusiness } from "../supabase/supabase.functions.js";
import {
  FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT,
  googleReviewUrl,
  isCustomerReviewSendBlocked,
  isReviewSendBlocked,
  nextZonedMonthStart,
  reviewEmailUsage,
  zonedMonthStart,
} from "../lib/reviewRequest.js";
import { sendReviewRequestEmail } from "../lib/reviewRequestSend.js";
import { markWebsiteLeadReviewSent } from "./website-leads.controller.js";

const { ACCESS_DENIED, SUPABASE_ERROR, SERVER_ERROR, YUP_ERROR, TOO_MANY_REQUESTS } =
  errorCodes;

const PAGE_SIZE = 5;

function requestedPage(query) {
  const page = Number(query?.page);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 100);
}

function mapReviewRequest(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    message: row.message,
    reviewUrl: row.review_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function loadOwnedBusiness(req, res) {
  const ownerUid = req.user?.id;
  const accessToken = req.accessToken;
  if (!ownerUid || !accessToken) {
    res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Authentication required."));
    return null;
  }

  const { businessId } = req.params;
  const { data: business, error } = await getOwnedBusiness(
    businessId,
    ownerUid,
    accessToken
  );

  if (error) {
    res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "There was an error verifying business ownership.",
        error
      )
    );
    return null;
  }

  if (!business) {
    res
      .status(403)
      .json(
        customErrorHandler(ACCESS_DENIED, "You do not own this business listing.")
      );
    return null;
  }

  return business;
}

function exactIlike(value) {
  return String(value).replace(/[\\%_]/g, "\\$&");
}

async function countSentThisMonth(businessId, timezone) {
  const monthStart = zonedMonthStart(timezone);
  const { count, error } = await supabase
    .from("review_requests")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("status", "sent")
    .gte("created_at", monthStart.toISOString());

  if (error) return { count: null, error };
  return { count: count ?? 0, error: null };
}

async function countSentToCustomerThisMonth(businessId, timezone, customerEmail) {
  const monthStart = zonedMonthStart(timezone);
  const email = customerEmail.trim().toLowerCase();
  const { count, error } = await supabase
    .from("review_requests")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("status", "sent")
    .gte("created_at", monthStart.toISOString())
    .ilike("customer_email", exactIlike(email));

  if (error) return { count: null, error };
  return { count: count ?? 0, error: null };
}

function usagePayload(business, sentThisMonth) {
  return {
    ...reviewEmailUsage({
      isPartner: Boolean(business.is_partner),
      sentThisMonth,
    }),
    resetsAt: nextZonedMonthStart(business.timezone).toISOString(),
  };
}

export const listReviewRequestsHandler = async (req, res) => {
  const business = await loadOwnedBusiness(req, res);
  if (!business) return;

  if (!business.is_featured) {
    return res.status(403).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Review emails are included with a Featured listing."
      )
    );
  }

  const { count, error: countError } = await countSentThisMonth(
    business.id,
    business.timezone
  );
  if (countError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to load review emails.",
        countError
      )
    );
  }

  const page = requestedPage(req.query);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count: totalCount } = await supabase
    .from("review_requests")
    .select(
      "id, customer_name, customer_email, message, review_url, status, created_at",
      { count: "exact" }
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load review emails.", error)
    );
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return res.status(200).json(
    successHandler({
      requests: (data ?? []).map(mapReviewRequest),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
      },
      usage: usagePayload(business, count),
      reviewUrl: googleReviewUrl(business.place_id),
      messageTemplate:
        typeof business.review_message_template === "string"
          ? business.review_message_template
          : null,
    })
  );
};

export const saveReviewMessageTemplateHandler = async (req, res) => {
  const business = await loadOwnedBusiness(req, res);
  if (!business) return;

  if (!business.is_featured) {
    return res.status(403).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Review emails are included with a Featured listing."
      )
    );
  }

  const messageTemplate =
    req.body.messageTemplate === null
      ? null
      : String(req.body.messageTemplate || "").trim();

  const { error } = await supabase
    .from("businesses")
    .update({ review_message_template: messageTemplate })
    .eq("id", business.id);

  if (error) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save this review message.",
        error
      )
    );
  }

  return res.status(200).json(successHandler({ messageTemplate }));
};

export const sendReviewRequestHandler = async (req, res) => {
  const business = await loadOwnedBusiness(req, res);
  if (!business) return;

  if (!business.is_featured) {
    return res.status(403).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Review emails are included with a Featured listing."
      )
    );
  }

  const reviewUrl = googleReviewUrl(business.place_id);
  if (!reviewUrl) {
    return res.status(422).json(
      customErrorHandler(
        YUP_ERROR,
        "This listing does not have a Google place ID yet."
      )
    );
  }

  const { count, error: countError } = await countSentThisMonth(
    business.id,
    business.timezone
  );
  if (countError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to check the monthly review email limit.",
        countError
      )
    );
  }

  const usage = usagePayload(business, count);
  if (isReviewSendBlocked(usage)) {
    return res.status(429).json(
      customErrorHandler(
        TOO_MANY_REQUESTS,
        `Featured listings can send ${FEATURED_REVIEW_EMAIL_MONTHLY_LIMIT} review emails per month.`
      )
    );
  }

  const customerName = String(req.body.customerName || "").trim();
  const customerEmail = String(req.body.customerEmail || "").trim();
  const message = String(req.body.message || "").trim();
  const { data: suppressions, error: suppressionError } = await supabase
    .from("email_suppressions")
    .select("id")
    .eq("business_id", business.id)
    .ilike("email", exactIlike(customerEmail.toLowerCase()))
    .limit(1);
  if (suppressionError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to check review email preferences for this customer.",
        suppressionError
      )
    );
  }
  if (suppressions?.length) {
    return res.status(422).json(
      customErrorHandler(
        YUP_ERROR,
        "This customer unsubscribed from emails for this shop."
      )
    );
  }

  const { count: sentToCustomer, error: customerCountError } =
    await countSentToCustomerThisMonth(
      business.id,
      business.timezone,
      customerEmail
    );
  if (customerCountError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to check review emails for this customer.",
        customerCountError
      )
    );
  }
  if (isCustomerReviewSendBlocked(sentToCustomer)) {
    return res.status(429).json(
      customErrorHandler(
        TOO_MANY_REQUESTS,
        "This customer already received 2 review emails this month."
      )
    );
  }
  const sendResult = await sendReviewRequestEmail({
    businessId: business.id,
    shopTitle: business.title,
    message,
    reviewUrl,
    customerEmail,
    replyTo: business.email,
  });

  const status = sendResult.ok ? "sent" : "failed";
  const errorMessage = sendResult.ok
    ? null
    : String(sendResult.error?.message || "Unable to send this email.").slice(
        0,
        500
      );

  const { data: inserted, error: insertError } = await supabase
    .from("review_requests")
    .insert({
      business_id: business.id,
      owner_uid: business.owner_uid,
      customer_name: customerName,
      customer_email: customerEmail,
      message,
      review_url: reviewUrl,
      resend_email_id: sendResult.ok ? sendResult.data?.id ?? null : null,
      status,
      error: errorMessage,
    })
    .select(
      "id, customer_name, customer_email, message, review_url, status, created_at"
    )
    .single();

  if (insertError) {
    return res.status(500).json(
      customErrorHandler(
        SUPABASE_ERROR,
        "Unable to save this review email.",
        insertError
      )
    );
  }

  if (!sendResult.ok) {
    return res.status(502).json(
      customErrorHandler(
        SERVER_ERROR,
        "Unable to send this review email."
      )
    );
  }

  const websiteLeadId =
    typeof req.body.websiteLeadId === "string" ? req.body.websiteLeadId.trim() : "";
  if (websiteLeadId) {
    await markWebsiteLeadReviewSent({
      businessId: business.id,
      leadId: websiteLeadId,
      customerEmail,
    });
  }

  const sentCount = count + 1;
  return res.status(200).json(
    successHandler({
      request: mapReviewRequest(inserted),
      usage: usagePayload(business, sentCount),
    })
  );
};
