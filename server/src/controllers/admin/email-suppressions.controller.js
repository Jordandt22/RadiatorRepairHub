import {
  customErrorHandler,
  errorCodes,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import {
  buildIlikeOrFilter,
  sanitizeIlikeSearch,
} from "../../lib/sanitizeSearch.js";
import { EMAIL_SUPPRESSION_QUERY_TYPES } from "../../schemas/email-suppressions.schemas.js";
import { supabase } from "../../supabase/supabase.js";

const { SUPABASE_ERROR } = errorCodes;

const PAGE_SIZE = 20;
const BUSINESS_SEARCH_CAP = 100;
const SUPPRESSION_TYPES = new Set(EMAIL_SUPPRESSION_QUERY_TYPES);

const SUPPRESSION_COLUMNS =
  "id, email, suppression_type, source, created_at, businesses!inner(id, title)";

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

export const listEmailSuppressionsHandler = async (req, res) => {
  const page = requestedPage(req.query);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const search = sanitizeIlikeSearch(req.query.q);
  const type = SUPPRESSION_TYPES.has(req.query.type) ? req.query.type : null;

  let request = supabase
    .from("email_suppressions")
    .select(SUPPRESSION_COLUMNS, { count: "exact" });
  if (type) request = request.eq("suppression_type", type);

  if (search) {
    const { ids, broad, error: searchError } = await businessIdsForTitle(search);
    if (searchError) {
      return res.status(500).json(
        customErrorHandler(SUPABASE_ERROR, "Unable to load email suppressions.", searchError)
      );
    }
    if (broad) {
      const titleFilter = buildIlikeOrFilter(["title"], search);
      request = request.or(titleFilter, { referencedTable: "businesses" });
    } else {
      const parts = [buildIlikeOrFilter(["email"], search)];
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
    return res.status(500).json(
      customErrorHandler(SUPABASE_ERROR, "Unable to load email suppressions.", error)
    );
  }

  const total = count ?? 0;
  return res.status(200).json(
    successHandler({
      suppressions: (data ?? []).map((row) => ({
        id: row.id,
        email: row.email,
        type: row.suppression_type,
        source: row.source,
        createdAt: row.created_at,
        ...embeddedBusiness(row),
      })),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
      },
    })
  );
};
