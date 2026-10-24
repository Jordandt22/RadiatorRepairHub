import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../helpers/customErrorHandler.js";
import { logger } from "../lib/logger.js";
import {
  buildIlikeOrFilter,
  sanitizeIlikeSearch,
} from "../lib/sanitizeSearch.js";
import { supabase } from "../supabase/supabase.js";
import { getOwnedBusiness } from "../supabase/supabase.functions.js";

const { ACCESS_DENIED, SUPABASE_ERROR } = errorCodes;

const PAGE_SIZE = 10;

const LEAD_SORTS = new Set(["newest", "oldest", "name_asc", "name_desc"]);
const LEAD_STATUSES = new Set(["new", "review_sent"]);

function requestedLeadSort(query) {
  return LEAD_SORTS.has(query?.sort) ? query.sort : "newest";
}

function requestedLeadStatus(query) {
  return LEAD_STATUSES.has(query?.status) ? query.status : null;
}

function requestedLeadService(query) {
  if (typeof query?.service !== "string") return "";
  return query.service.trim().slice(0, 200);
}

function orderWebsiteLeads(query, sort) {
  if (sort === "oldest") {
    return query
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
  }
  if (sort === "name_asc") {
    return query
      .order("customer_name", { ascending: true })
      .order("created_at", { ascending: false });
  }
  if (sort === "name_desc") {
    return query
      .order("customer_name", { ascending: false })
      .order("created_at", { ascending: false });
  }
  return query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
}

function requestedPage(query) {
  const page = Number(query?.page);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 100);
}

function mapWebsiteLead(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    service: row.service,
    vehicle: row.vehicle,
    issue: row.issue,
    status: row.status,
    createdAt: row.created_at,
    reviewSentAt: row.review_sent_at,
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

export const listWebsiteLeadsHandler = async (req, res) => {
  const business = await loadOwnedBusiness(req, res);
  if (!business) return;

  if (!business.is_partner) {
    return res.status(403).json(
      customErrorHandler(
        ACCESS_DENIED,
        "Website leads are included with a Partner listing."
      )
    );
  }

  const page = requestedPage(req.query);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const search = sanitizeIlikeSearch(req.query.q);
  const sort = requestedLeadSort(req.query);
  const status = requestedLeadStatus(req.query);
  const service = requestedLeadService(req.query);
  let query = supabase
    .from("website_leads")
    .select(
      "id, customer_name, customer_phone, customer_email, service, vehicle, issue, status, created_at, review_sent_at",
      { count: "exact" }
    )
    .eq("business_id", business.id);
  const orFilter = websiteLeadSearchFilter(search);
  if (orFilter) query = query.or(orFilter);
  if (status) query = query.eq("status", status);
  if (service) query = query.eq("service", service);
  const servicesQuery = supabase
    .from("website_leads")
    .select("service")
    .eq("business_id", business.id)
    .order("service", { ascending: true })
    .limit(1000);
  const [{ data, error, count }, { data: serviceRows, error: serviceError }] =
    await Promise.all([
      orderWebsiteLeads(query, sort).range(from, to),
      servicesQuery,
    ]);

  if (error) {
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load website leads.", error)
    );
  }

  if (serviceError) {
    logger.error({ err: serviceError }, "Website lead services were not loaded");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return res.status(200).json(
    successHandler({
      leads: (data ?? []).map(mapWebsiteLead),
      services: uniqueLeadServices(serviceRows),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
      },
    })
  );
};

function uniqueLeadServices(rows) {
  const names = new Set();
  for (const row of rows ?? []) {
    const service = typeof row?.service === "string" ? row.service.trim() : "";
    if (service) names.add(service);
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}

function websiteLeadSearchFilter(search) {
  const orFilter = buildIlikeOrFilter(
    ["customer_name", "customer_email", "customer_phone", "vehicle"],
    search
  );
  if (!orFilter) return null;
  const digits = search.replace(/\D/g, "");
  if (digits.length < 4) return orFilter;
  return `${orFilter},customer_phone.ilike."%${digits.split("").join("%")}%"`;
}

/** After a review email sends, mark the matching website lead. */
export async function markWebsiteLeadReviewSent({
  businessId,
  leadId,
  customerEmail,
}) {
  const email = String(customerEmail || "").trim().toLowerCase();
  if (!leadId || !email) return;

  const { data, error } = await supabase
    .from("website_leads")
    .select("id, customer_email")
    .eq("id", leadId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) {
    logger.error({ err: error }, "Website lead lookup failed after review email");
    return;
  }

  const leadEmail = String(data?.customer_email || "").trim().toLowerCase();
  if (!data || leadEmail !== email) return;

  const { error: updateError } = await supabase
    .from("website_leads")
    .update({
      status: "review_sent",
      review_sent_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("business_id", businessId);

  if (updateError) {
    logger.error({ err: updateError }, "Website lead was not marked review sent");
  }
}
