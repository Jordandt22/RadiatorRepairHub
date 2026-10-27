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
import {
  buildIlikeOrFilter,
  sanitizeIlikeSearch,
} from "../../lib/sanitizeSearch.js";
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

function mapPartnerSite(business, site, accountEmail = null, intake = null) {
  const domain = site?.domain || null;
  return {
    businessId: business.id,
    title: business.title,
    domain,
    allowedOrigins: allowedOriginsForDomain(domain),
    apiKey: site?.api_key || null,
    notificationEmail: resolveNotificationRecipient(business, accountEmail),
    intakeStatus: intake?.status === "submitted" ? "submitted" : "needs_info",
    intakeSubmittedAt: intake?.submitted_at ?? null,
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
  let intakes = [];
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

    const { data: intakeRows, error: intakeError } = await supabase
      .from("partner_website_intakes")
      .select("business_id, status, submitted_at")
      .in("business_id", ids);
    if (intakeError) {
      return res.status(500).json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Unable to load website intake status.",
          intakeError
        )
      );
    }
    intakes = intakeRows ?? [];
  }

  const byId = new Map(sites.map((site) => [site.business_id, site]));
  const intakeById = new Map(intakes.map((row) => [row.business_id, row]));
  const accountEmails = await accountEmailsByOwner(businesses);
  return res.status(200).json(
    successHandler({
      sites: (businesses ?? []).map((business) =>
        mapPartnerSite(
          business,
          byId.get(business.id),
          accountEmails.get(business.owner_uid) ?? null,
          intakeById.get(business.id) ?? null
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
  const { data: intake } = await supabase
    .from("partner_website_intakes")
    .select("business_id, status, submitted_at")
    .eq("business_id", businessId)
    .maybeSingle();
  return res.status(200).json(
    successHandler({
      site: mapPartnerSite(
        business,
        { domain, api_key: apiKey },
        accountEmails.get(business.owner_uid) ?? null,
        intake
      ),
    })
  );
};

const MESSAGE_PAGE_SIZE = 20;

function requestedPage(query) {
  const page = Number(query?.page);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 100);
}

function embeddedBusiness(row) {
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
  return {
    businessId: business?.id ?? null,
    businessTitle: business?.title || "Unknown listing",
  };
}

const BUSINESS_SEARCH_CAP = 100;

async function businessIdsForTitle(search) {
  const titleFilter = buildIlikeOrFilter(["title"], search);
  if (!titleFilter) return { ids: [], broad: false, error: null };

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .or(titleFilter);
  if (countError) return { ids: [], broad: false, error: countError };
  if (!count || count > BUSINESS_SEARCH_CAP) {
    return { ids: [], broad: count > BUSINESS_SEARCH_CAP, error: null };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .or(titleFilter)
    .limit(BUSINESS_SEARCH_CAP);
  if (error) return { ids: [], broad: false, error };
  return { ids: (data ?? []).map((row) => row.id), broad: false, error: null };
}

async function listPagedMessages(req, res, { table, columns, searchColumns, mapRow, errorMessage }) {
  const page = requestedPage(req.query);
  const from = (page - 1) * MESSAGE_PAGE_SIZE;
  const to = from + MESSAGE_PAGE_SIZE - 1;
  const search = sanitizeIlikeSearch(req.query.q);
  let request = supabase.from(table).select(columns, { count: "exact" });

  if (search) {
    const { ids, broad, error: searchError } = await businessIdsForTitle(search);
    if (searchError) {
      return res.status(500).json(customErrorHandler(SUPABASE_ERROR, errorMessage, searchError));
    }
    if (broad) {
      const titleFilter = buildIlikeOrFilter(["title"], search);
      request = request.or(titleFilter, { referencedTable: "businesses" });
    } else {
      const parts = [buildIlikeOrFilter(searchColumns, search)];
      if (ids.length) parts.push(`business_id.in.(${ids.join(",")})`);
      const orFilter = parts.filter(Boolean).join(",");
      if (orFilter) request = request.or(orFilter);
    }
  }

  const { data, error, count } = await request
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json(customErrorHandler(SUPABASE_ERROR, errorMessage, error));
  }

  const total = count ?? 0;
  return res.status(200).json(
    successHandler({
      messages: (data ?? []).map(mapRow),
      pagination: {
        page,
        pageSize: MESSAGE_PAGE_SIZE,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / MESSAGE_PAGE_SIZE),
      },
    })
  );
}

const LEAD_COLUMNS =
  "id, customer_name, customer_phone, customer_email, service, vehicle, issue, status, created_at, review_sent_at, businesses!inner(id, title)";

const REVIEW_COLUMNS =
  "id, customer_name, customer_email, message, review_url, status, error, created_at, businesses!inner(id, title)";

const LEAD_SEARCH_COLUMNS = [
  "customer_name",
  "customer_email",
  "customer_phone",
];

const REVIEW_SEARCH_COLUMNS = ["customer_name", "customer_email"];

export const listPartnerLeadFollowUpsHandler = (req, res) =>
  listPagedMessages(req, res, {
    table: "website_leads",
    columns: LEAD_COLUMNS,
    searchColumns: LEAD_SEARCH_COLUMNS,
    errorMessage: "Unable to load lead follow-ups.",
    mapRow: (row) => ({
      id: row.id,
      ...embeddedBusiness(row),
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerEmail: row.customer_email,
      service: row.service,
      vehicle: row.vehicle,
      message: row.issue,
      status: row.status,
      createdAt: row.created_at,
      reviewSentAt: row.review_sent_at,
    }),
  });

export const listPartnerReviewRequestsHandler = (req, res) =>
  listPagedMessages(req, res, {
    table: "review_requests",
    columns: REVIEW_COLUMNS,
    searchColumns: REVIEW_SEARCH_COLUMNS,
    errorMessage: "Unable to load review requests.",
    mapRow: (row) => ({
      id: row.id,
      ...embeddedBusiness(row),
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      message: row.message,
      reviewUrl: row.review_url,
      status: row.status,
      error: row.error,
      createdAt: row.created_at,
    }),
  });

